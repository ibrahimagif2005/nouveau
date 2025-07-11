// backend/routes/productRoutes.js
const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getRecommendations, // Ajouté ici
  searchProducts,   // Ajouté ici
} = require('../controllers/productController');
const { protect, authorize } = require('../middlewares/auth'); // authorize est pour les rôles (ex: admin)
const validate = require('../middlewares/validate');
const { productSchema, updateProductSchema } = require('../validators/productValidator');
const Joi = require('joi'); // Import Joi for param validation if needed

const router = express.Router();

// Schéma pour la validation de l'ID MongoDB dans les paramètres de la route
const mongoIdParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required().messages({
    'string.hex': "L'ID doit être une chaîne hexadécimale.",
    'string.length': "L'ID doit avoir une longueur de 24 caractères.",
    'any.required': "L'ID est requis.",
  })
});

router
  .route('/')
  .get(getProducts) // Pourrait avoir une validation des query params (pagination, filtres)
  .post(protect, authorize('admin'), validate(productSchema), createProduct);

router
  .route('/:id')
  .get(validate(mongoIdParamSchema, 'params'), getProductById)
  .put(protect, authorize('admin'), validate(mongoIdParamSchema, 'params'), validate(updateProductSchema), updateProduct)
  .delete(protect, authorize('admin'), validate(mongoIdParamSchema, 'params'), deleteProduct);

// Route pour les recommandations
router.get('/:id/recommendations', validate(mongoIdParamSchema, 'params'), getRecommendations);

// Route pour la recherche de produits
router.get('/search', searchProducts);

// Importer les routes des avis pour les imbriquer
const reviewRouter = require('./reviewRoutes');
const { createReview, getReviewsForProduct } = require('../controllers/reviewController'); // Importer les handlers
const { reviewSchemaValidation: reviewValidationSchema } = require('../validators/reviewValidator'); // Importer le schéma de validation Joi pour les avis

// Ré-router vers reviewRouter pour les routes spécifiques aux avis d'un produit
// Exemple: /api/products/:productId/reviews
router.use('/:productId/reviews', reviewRouter); // Ceci est pour PUT et DELETE sur /:reviewId

// Routes directes sur productRoutes pour GET et POST les avis d'un produit
const productIdParamSchema = Joi.object({
  productId: Joi.string().hex().length(24).required().messages({
    'string.hex': "L'ID du produit doit être une chaîne hexadécimale.",
    'string.length': "L'ID du produit doit avoir une longueur de 24 caractères.",
    'any.required': "L'ID du produit est requis.",
  })
});


router.route('/:productId/reviews')
    .post(protect, validate(productIdParamSchema, 'params'), validate(reviewValidationSchema), createReview)
    .get(validate(productIdParamSchema, 'params'), getReviewsForProduct);


module.exports = router;
