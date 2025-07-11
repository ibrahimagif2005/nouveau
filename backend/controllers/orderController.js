// backend/controllers/orderController.js
const Order = require('../models/Order');
const Product = require('../models/Product'); // Nécessaire pour la création, non pour populate directement ici mais bonne pratique de l'avoir
const { AppError } = require('../utils/errorHandler'); // Pour la gestion d'erreurs personnalisée

// @desc    Créer une nouvelle commande et initier une intention de paiement Stripe
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  const { orderItems, shippingAddress, paymentMethod = 'Stripe' } = req.body; // paymentMethod par défaut à Stripe

  if (!orderItems || orderItems.length === 0) {
    return next(new AppError('Aucun article dans la commande', 400));
  }

  try {
    // 1. Vérifier les prix et calculer le total côté serveur pour la sécurité
    let calculatedItemsPrice = 0;
    const populatedOrderItems = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.product); // item.product est l'ID du produit
      if (!product) {
        return next(new AppError(`Produit non trouvé: ID ${item.product}`, 404));
      }
      if (product.stock < item.quantity) {
        return next(new AppError(`Stock insuffisant pour ${product.name}. Demandé: ${item.quantity}, Disponible: ${product.stock}`, 400));
      }
      calculatedItemsPrice += product.price * item.quantity;
      populatedOrderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price, // Utiliser le prix de la BDD
        imageUrl: product.imageUrl,
      });
    }

    // TODO: Calculer taxPrice et shippingPrice de manière plus dynamique si nécessaire
    const taxPrice = parseFloat((calculatedItemsPrice * 0.1).toFixed(2)); // Exemple: taxe de 10%
    const shippingPrice = calculatedItemsPrice > 100 ? 0 : 5; // Exemple: livraison gratuite si > 100€
    const totalPrice = parseFloat((calculatedItemsPrice + taxPrice + shippingPrice).toFixed(2));

    // 2. Créer la commande en base de données avec statut 'En attente de paiement'
    const order = new Order({
      user: req.user._id,
      orderItems: populatedOrderItems, // Utiliser les items populés avec les prix serveur
      shippingAddress,
      paymentMethod,
      itemsPrice: calculatedItemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      status: 'En attente de paiement',
    });

    const createdOrder = await order.save();

    // 3. Créer l'intention de paiement Stripe
    // Assurez-vous que createPaymentIntent est importé ou défini dans ce fichier ou un service
    const { createPaymentIntent } = require('../utils/paymentService');
    const paymentIntent = await createPaymentIntent(
      createdOrder.totalPrice, // Utiliser le totalPrice de la commande créée
      'eur', // ou la devise de la commande
      { order_id: createdOrder._id.toString() } // Lier l'intention de paiement à l'ID de la commande
    );

    // Il n'est généralement pas nécessaire de sauvegarder le client_secret dans la commande ici,
    // car il est à usage unique pour le client. Mais on peut le retourner.

    res.status(201).json({
      success: true,
      order: createdOrder,
      clientSecret: paymentIntent.client_secret, // Envoyer le client_secret au frontend
      paymentIntentId: paymentIntent.id
    });

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
