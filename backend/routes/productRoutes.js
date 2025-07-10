// backend/routes/productRoutes.js
const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
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

module.exports = router;
