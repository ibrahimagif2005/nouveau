// backend/routes/orderRoutes.js
const express = require('express');
const {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
  getAllOrders,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Pour les utilisateurs connectés
router.route('/')
  .post(protect, createOrder)
  // Seuls les admins peuvent voir toutes les commandes
  .get(protect, authorize('admin'), getAllOrders);

router.route('/myorders').get(protect, getMyOrders); // Commandes de l'utilisateur connecté

// Ces routes doivent être après /myorders pour éviter les conflits de route
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);
// Une route pour marquer comme livré (admin seulement) pourrait être ajoutée ici
// router.route('/:id/deliver').put(protect, authorize('admin'), updateOrderToDelivered);


module.exports = router;
