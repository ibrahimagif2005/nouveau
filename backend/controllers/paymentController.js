// backend/controllers/paymentController.js
const { createPaymentIntent } = require('../utils/paymentService');
const { AppError } = require('../utils/errorHandler');
const Order = require('../models/Order'); // Pour récupérer le montant de la commande

// @desc    Créer une intention de paiement Stripe
// @route   POST /api/payment/create-intent
// @access  Private
exports.stripePaymentIntent = async (req, res, next) => {
  const { orderId, amount, currency } = req.body; // 'amount' et 'currency' pourraient venir du client ou être récupérés de la commande

  try {
    let paymentAmount = amount;
    let paymentCurrency = currency || 'eur'; // Devise par défaut

    // Optionnel mais recommandé: Récupérer le montant directement depuis la commande en base de données
    // pour éviter toute manipulation du montant côté client.
    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) {
        return next(new AppError('Commande non trouvée pour créer l\'intention de paiement.', 404));
      }
      // S'assurer que la commande appartient à l'utilisateur connecté (sauf si admin)
      if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
          return next(new AppError('Non autorisé à créer une intention de paiement pour cette commande.', 403));
      }
      if (order.isPaid) {
          return next(new AppError('Cette commande a déjà été payée.', 400));
      }
      paymentAmount = order.totalPrice; // Utiliser le totalPrice de la commande
      // La devise pourrait aussi être stockée dans la commande ou être globale à l'application
    } else if (!amount) {
        // Si ni orderId ni amount n'est fourni (ou si amount est 0 après récupération)
        return next(new AppError('Le montant de la commande ou un montant direct est requis pour créer une intention de paiement.', 400));
    }

    if (paymentAmount <= 0) {
        return next(new AppError('Le montant pour l\'intention de paiement doit être positif.', 400));
    }

    const paymentIntent = await createPaymentIntent(paymentAmount, paymentCurrency, { order_id: orderId || 'N/A' });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret, // Le client secret est crucial pour le frontend (Stripe Elements)
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    // L'erreur de createPaymentIntent est déjà loggée dans paymentService.js
    // On peut ici choisir de la renvoyer telle quelle ou de la personnaliser davantage.
    next(new AppError(error.message || 'Erreur lors de la création de l\'intention de paiement.', 500));
  }
};

// Vous pourriez ajouter d'autres fonctions ici, par exemple pour gérer les webhooks Stripe
// exports.stripeWebhookHandler = async (req, res, next) => { ... }
