// backend/middlewares/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assurez-vous que le chemin est correct

// Protéger les routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // else if (req.cookies.token) { // Optionnel: vérifier les cookies si vous utilisez des cookies pour le token
  //   token = req.cookies.token;
  // }

  // S'assurer que le token existe
  if (!token) {
    return res.status(401).json({ success: false, message: 'Non autorisé à accéder à cette route (pas de token)' });
  }

  try {
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'votre_secret_jwt_ici'); // Remplacez par votre variable d'environnement

    req.user = await User.findById(decoded.id); // Ajouter l'utilisateur à l'objet req

    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Utilisateur non trouvé pour ce token' });
    }

    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ success: false, message: 'Non autorisé à accéder à cette route (token invalide)' });
  }
};

// Accorder l'accès à des rôles spécifiques
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ // 403 Forbidden
        success: false,
        message: `L'utilisateur avec le rôle '${req.user ? req.user.role : 'aucun'}' n'est pas autorisé à accéder à cette route`,
      });
    }
    next();
  };
};
