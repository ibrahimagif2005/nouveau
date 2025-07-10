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
  // Logique pour obtenir l'utilisateur (depuis req.user défini par le middleware d'auth)
  res.status(200).json({ success: true, data: { id: 'user_id_placeholder', name: 'User Name Placeholder' } });
};
