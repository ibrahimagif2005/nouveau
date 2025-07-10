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

const router = express.Router();

router
  .route('/')
  .get(getProducts)
  // Seuls les admins peuvent créer des produits
  .post(protect, authorize('admin'), createProduct);

router
  .route('/:id')
  .get(getProductById)
  // Seuls les admins peuvent modifier ou supprimer des produits
  .put(protect, authorize('admin'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

module.exports = router;
