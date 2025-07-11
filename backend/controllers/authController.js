// backend/controllers/authController.js

// @desc    Enregistrer un nouvel utilisateur
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res, next) => {
  // Logique d'enregistrement ici
  res.status(201).json({ success: true, message: 'Utilisateur enregistré (placeholder)' });
};

// @desc    Connecter un utilisateur / Retourner un token JWT
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res, next) => {
  // Logique de connexion ici
  res.status(200).json({ success: true, token: 'jwt_token_placeholder', message: 'Utilisateur connecté (placeholder)' });
};

// @desc    Obtenir les informations de l'utilisateur connecté
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  // req.user est déjà défini par le middleware 'protect'
  // On peut sélectionner les champs à retourner si nécessaire
  const user = await User.findById(req.user.id).select('-password -refreshTokens'); // Exclure les champs sensibles
  if (!user) {
    return next(new AppError('Utilisateur non trouvé.', 404));
  }
  res.status(200).json({ success: true, data: user });
};

// --- Helpers pour JWT et Refresh Tokens ---
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Pour générer le refresh token
const User = require('../models/User'); // Assurez-vous que le chemin est correct
const { AppError } = require('../utils/errorHandler');

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m',
  });
};

const generateAndStoreRefreshToken = async (user, req) => {
  const refreshToken = crypto.randomBytes(40).toString('hex');
  const refreshTokenExpiresDays = parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN_DAYS || '7');
  const expires = new Date(Date.now() + refreshTokenExpiresDays * 24 * 60 * 60 * 1000);

  user.refreshTokens.push({
    token: refreshToken, // Idéalement, stocker un hash de ce token
    expires: expires,
    deviceInfo: req.headers['user-agent'] || 'Unknown Device',
    createdAt: new Date()
  });
  await user.save({ validateBeforeSave: false }); // validateBeforeSave: false pour éviter les problèmes de validation de mot de passe si non modifié
  return { token: refreshToken, expires };
};

const sendRefreshTokenCookie = (res, token, expires) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: expires, // Date d'expiration du cookie
    // path: '/api/auth', // Optionnel: restreindre le chemin du cookie
  });
};
// --- Fin Helpers ---


// @desc    Enregistrer un nouvel utilisateur
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res, next) => {
  const { name, email, password, role, address } = req.body;
  try {
    const user = await User.create({ name, email, password, role, address });
    // Optionnel: connecter l'utilisateur directement après l'enregistrement
    // Pour cela, on générerait et enverrait les tokens ici aussi.
    // Pour l'instant, on renvoie juste un succès et l'utilisateur doit se connecter.
    res.status(201).json({ success: true, message: 'Utilisateur enregistré avec succès. Veuillez vous connecter.' });
  } catch (error) {
    next(error); // Laisser errorHandler.js gérer
  }
};


// @desc    Connecter un utilisateur / Retourner un token JWT
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return next(new AppError('Veuillez fournir un email et un mot de passe', 400));
    }

    const user = await User.findOne({ email }).select('+password'); // Sélectionner le mot de passe explicitement
    if (!user || !(await user.matchPassword(password))) {
      return next(new AppError('Email ou mot de passe incorrect', 401));
    }

    // Générer Access Token
    const accessToken = generateAccessToken(user._id);

    // Générer et stocker Refresh Token
    const refreshTokenData = await generateAndStoreRefreshToken(user, req);
    sendRefreshTokenCookie(res, refreshTokenData.token, refreshTokenData.expires);

    // Nettoyer l'objet utilisateur avant de le renvoyer (si on le renvoie)
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshTokens;

    res.status(200).json({
      success: true,
      accessToken,
      user: userResponse, // Optionnel: renvoyer les infos utilisateur
      message: 'Connexion réussie'
    });

  } catch (error) {
    next(error);
  }
};


// @desc    Rafraîchir le token d'accès
// @route   POST /api/auth/refresh-token
// @access  Public (nécessite un cookie refreshToken valide)
exports.refreshAccessToken = async (req, res, next) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  if (!incomingRefreshToken) {
    return next(new AppError('Accès refusé. Aucun token de rafraîchissement fourni.', 401));
  }

  try {
    // Trouver l'utilisateur par le refresh token (non expiré)
    // Idéalement, le token stocké en BDD serait un hash du token envoyé par le client.
    // Pour cette implémentation, on compare le token en clair.
    const user = await User.findOne({
      'refreshTokens.token': incomingRefreshToken,
      'refreshTokens.expires': { $gt: new Date() }
    });

    if (!user) {
      // Si le refresh token n'est pas valide ou est expiré, on peut aussi effacer le cookie côté client.
      res.cookie('refreshToken', '', { httpOnly: true, expires: new Date(0), sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
      return next(new AppError('Token de rafraîchissement invalide ou expiré.', 403)); // 403 Forbidden car le token est "mauvais"
    }

    // Optionnel: Implémenter la rotation des refresh tokens
    // 1. Supprimer l'ancien refresh token de la BDD
    // user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== incomingRefreshToken);
    // 2. Générer un nouveau refresh token et un nouveau access token
    // const newRefreshTokenData = await generateAndStoreRefreshToken(user, req);
    // sendRefreshTokenCookie(res, newRefreshTokenData.token, newRefreshTokenData.expires);
    // const newAccessToken = generateAccessToken(user._id);
    // res.json({ success: true, accessToken: newAccessToken });

    // Version sans rotation pour l'instant:
    const newAccessToken = generateAccessToken(user._id);
    res.status(200).json({ success: true, accessToken: newAccessToken });

  } catch (error) {
    next(error);
  }
};


// @desc    Déconnecter l'utilisateur (invalider le refresh token)
// @route   POST /api/auth/logout
// @access  Private (l'utilisateur doit être connecté pour se déconnecter de cette session)
exports.logoutUser = async (req, res, next) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  if (incomingRefreshToken) {
    try {
      // Supprimer le refresh token spécifique de la base de données
      await User.updateOne(
        { _id: req.user._id }, // req.user est défini par le middleware 'protect' qui valide l'accessToken
        { $pull: { refreshTokens: { token: incomingRefreshToken } } }
      );
    } catch (error) {
      // Même si la suppression en BDD échoue, on continue pour effacer le cookie
      console.error("Erreur lors de la suppression du refresh token en BDD lors de la déconnexion:", error);
    }
  }

  // Effacer le cookie refreshToken
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0), // Date dans le passé pour supprimer le cookie
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json({ success: true, message: 'Déconnexion réussie.' });
};
