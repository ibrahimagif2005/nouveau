// backend/controllers/orderController.js
const Order = require('../models/Order');
const Product = require('../models/Product'); // Nécessaire pour la création, non pour populate directement ici mais bonne pratique de l'avoir
const { AppError } = require('../utils/errorHandler'); // Pour la gestion d'erreurs personnalisée

// @desc    Créer une nouvelle commande
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return next(new AppError('Aucun article dans la commande', 400));
  }
  // TODO: Vérifier la disponibilité des produits et les prix côté serveur avant de créer la commande

  try {
    const order = new Order({
      user: req.user._id, // Depuis le middleware protect
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      status: 'En attente de paiement', // Statut initial
    });

    const createdOrder = await order.save();
    // TODO: Décrémenter le stock des produits
    res.status(201).json({ success: true, data: createdOrder });
  } catch (error) {
    next(error);
  }
};

// @desc    Récupérer une commande par ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email') // Populer les infos de l'utilisateur
      .populate('orderItems.product', 'name price imageUrl'); // Populer les détails du produit dans chaque orderItem

    if (!order) {
      return next(new AppError('Commande non trouvée', 404));
    }
    // Vérifier si l'utilisateur a le droit de voir cette commande (soit c'est sa commande, soit c'est un admin)
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new AppError('Non autorisé à voir cette commande', 403));
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour le statut de paiement de la commande
// @route   PUT /api/orders/:id/pay
// @access  Private
exports.updateOrderToPaid = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new AppError('Commande non trouvée', 404));
    }

    // Logique pour vérifier le paiement (ex: via un webhook Stripe qui appelle une autre route, ou une confirmation manuelle)
    // Pour cet exemple, on suppose que le paiement est confirmé.
    order.isPaid = true;
    order.paidAt = Date.now();
    order.status = 'Payée'; // Mettre à jour le statut
    // order.paymentResult = { // Les détails du paiement seraient fournis par le corps de la requête ou le service de paiement
    //   id: req.body.id,
    //   status: req.body.status,
    //   update_time: req.body.update_time,
    //   email_address: req.body.email_address,
    // };

    const updatedOrder = await order.save();
    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    next(error);
  }
};

// @desc    Récupérer les commandes de l'utilisateur connecté
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('orderItems.product', 'name price imageUrl') // Populer les produits pour chaque commande
      .sort({ createdAt: -1 }); // Trier par date de création, les plus récentes en premier

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Récupérer toutes les commandes (Admin)
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id name email') // Populer l'utilisateur pour chaque commande
      // Optionnel: populer aussi les produits si nécessaire pour la vue admin, mais peut être lourd
      // .populate('orderItems.product', 'name price')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

// TODO: Ajouter des contrôleurs pour mettre à jour le statut de livraison (admin)
// exports.updateOrderToDelivered = async (req, res, next) => { ... }
