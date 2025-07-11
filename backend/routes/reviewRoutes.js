// backend/routes/reviewRoutes.js
const express = require('express');
const {
  createReview,      // Cette fonction sera dans productRoutes pour POST /api/products/:productId/reviews
  getReviewsForProduct, // Cette fonction sera dans productRoutes pour GET /api/products/:productId/reviews
  updateReview,
  deleteReview,
  checkUserReviewForProduct // Importer le nouveau contrôleur
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const Joi = require('joi');

const router = express.Router({ mergeParams: true }); // mergeParams est important pour accéder à :productId depuis productRoutes

// Schéma de validation pour la création/mise à jour d'un avis
const reviewSchemaValidation = Joi.object({
  rating: Joi.number().min(1).max(5).required().messages({
    'number.base': 'La note doit être un nombre.',
    'number.min': 'La note doit être au minimum de {#limit}.',
    'number.max': 'La note doit être au maximum de {#limit}.',
    'any.required': 'Une note est requise.',
  }),
  title: Joi.string().max(100).optional().allow('').messages({
    'string.max': 'Le titre ne doit pas dépasser {#limit} caractères.',
  }),
  comment: Joi.string().min(10).max(1000).required().messages({
    'string.base': 'Le commentaire doit être une chaîne de caractères.',
    'string.min': 'Le commentaire doit contenir au moins {#limit} caractères.',
    'string.max': 'Le commentaire ne doit pas dépasser {#limit} caractères.',
    'any.required': 'Un commentaire est requis.',
  })
});

const reviewIdParamSchema = Joi.object({
    reviewId: Joi.string().hex().length(24).required().messages({
        'string.hex': "L'ID de l'avis doit être une chaîne hexadécimale.",
        'string.length': "L'ID de l'avis doit avoir une longueur de 24 caractères.",
        'any.required': "L'ID de l'avis est requis.",
    })
});


// Les routes pour créer un avis et lister les avis d'un produit seront imbriquées dans productRoutes.
// router.route('/')
//   .post(protect, validate(reviewSchemaValidation), createReview) // Sera /api/products/:productId/reviews
//   .get(getReviewsForProduct);                                 // Sera /api/products/:productId/reviews

// Routes pour modifier ou supprimer un avis spécifique
router.route('/:reviewId')
  .put(protect, validate(reviewIdParamSchema, 'params'), validate(reviewSchemaValidation), updateReview)
  .delete(protect, validate(reviewIdParamSchema, 'params'), deleteReview);

// Route pour vérifier si l'utilisateur a déjà posté un avis pour un produit
const productIdParamSchemaForCheck = Joi.object({
    productId: Joi.string().hex().length(24).required().messages({
        'string.hex': "L'ID du produit doit être une chaîne hexadécimale.",
        'string.length': "L'ID du produit doit avoir une longueur de 24 caractères.",
        'any.required': "L'ID du produit est requis.",
    })
});
router.get('/user-check/:productId', protect, validate(productIdParamSchemaForCheck, 'params'), checkUserReviewForProduct);


module.exports = router;
