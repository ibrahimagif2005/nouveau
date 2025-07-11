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

// router.route('/myorders').get(protect, getMyOrders); // DÉPLACÉ VERS /api/users/orders

// Ces routes doivent être après /myorders pour éviter les conflits de route
router.route('/:id').get(protect, getOrderById); // Reste ici car c'est /api/orders/:id
router.route('/:id/pay').put(protect, updateOrderToPaid); // Reste ici
// Une route pour marquer comme livré (admin seulement) pourrait être ajoutée ici
// router.route('/:id/deliver').put(protect, authorize('admin'), updateOrderToDelivered);


module.exports = router;
