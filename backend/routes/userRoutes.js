// backend/routes/userRoutes.js
const express = require('express');
const {
  getProfile,
  updateProfile,
  toggleWishlist,
  getWishlist,
  getOrdersHistory // Renommée depuis getMyOrders
} = require('../controllers/userController');
const { protect } = require('../middlewares/auth'); // Middleware d'authentification
const validate = require('../middlewares/validate');
const Joi = require('joi'); // Pour la validation des params

const router = express.Router();

// Schéma de validation pour les mises à jour du profil
const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional().messages({
    'string.min': 'Le nom doit contenir au moins 2 caractères.',
    'string.max': 'Le nom ne doit pas dépasser 50 caractères.',
  }),
  email: Joi.string().email().optional().messages({
    'string.email': 'Veuillez fournir une adresse email valide.',
  }),
  address: Joi.string().max(255).optional().allow('').messages({ // Permet une chaîne vide pour effacer l'adresse
    'string.max': 'L\'adresse ne doit pas dépasser 255 caractères.',
  })
  // Ne pas inclure le mot de passe ici, gérer via une route dédiée pour la sécurité (ex: /api/users/update-password)
}).min(1).messages({ // Au moins un champ doit être fourni pour que la requête soit valide
    'object.min': 'Veuillez fournir au moins un champ à mettre à jour.'
});

// Schéma pour la validation de l'ID MongoDB dans les paramètres de la route
const mongoIdParamSchema = Joi.object({
  productId: Joi.string().hex().length(24).required().messages({
    'string.hex': "L'ID du produit doit être une chaîne hexadécimale.",
    'string.length': "L'ID du produit doit avoir une longueur de 24 caractères.",
    'any.required': "L'ID du produit est requis.",
  })
});

// Routes de profil utilisateur
router.route('/profile')
  .get(protect, getProfile)
  .put(protect, validate(updateProfileSchema), updateProfile);

// Routes de la Wishlist
router.route('/wishlist')
  .get(protect, getWishlist);

router.route('/wishlist/:productId')
  .post(protect, validate(mongoIdParamSchema, 'params'), toggleWishlist); // POST pour basculer l'état

// Route pour l'historique des commandes de l'utilisateur
router.get('/orders', protect, getOrdersHistory);


module.exports = router;
