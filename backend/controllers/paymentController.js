// backend/controllers/paymentController.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Importer et initialiser Stripe
const { createPaymentIntent } = require('../utils/paymentService');
const { AppError } = require('../utils/errorHandler');
const Order = require('../models/Order'); // Pour récupérer le montant de la commande et le mettre à jour
const Transaction = require('../models/Transaction'); // Importer le modèle Transaction

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
exports.stripeWebhookHandler = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    console.error('STRIPE_WEBHOOK_SECRET non configuré.');
    return res.status(500).send('Configuration serveur incomplète pour les webhooks Stripe.');
  }

  let event;

  try {
    // req.body est ici le payload brut de Stripe (grâce à express.raw dans la route)
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`⚠️ Erreur de vérification de la signature du webhook Stripe: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Gérer l'événement
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object;
      console.log('✅ PaymentIntent a réussi:', paymentIntentSucceeded.id);
      // Logique pour mettre à jour la commande, envoyer un email de confirmation, etc.
      // Exemple: Mettre à jour le statut de la commande dans la base de données
      try {
        const orderId = paymentIntentSucceeded.metadata.order_id; // Récupérer l'ID de commande depuis les métadonnées
        if (orderId && orderId !== 'N/A') {
          const order = await Order.findById(orderId);
          if (order) {
            order.isPaid = true;
            order.paidAt = new Date(paymentIntentSucceeded.created * 1000); // Convertir timestamp Unix en Date JS
            order.status = 'Payée'; // Ou 'En cours de traitement' si une action manuelle est requise ensuite
            order.paymentResult = {
              id: paymentIntentSucceeded.id,
              status: paymentIntentSucceeded.status,
              update_time: new Date(paymentIntentSucceeded.created * 1000).toISOString(),
              // email_address: paymentIntentSucceeded.receipt_email // si disponible
            };
            await order.save(); // Sauvegarde initiale de la commande mise à jour
            console.log(`Commande ${orderId} marquée comme payée.`);

            // Mettre à jour le stock
            const { updateStock } = require('../utils/stockService');
            await updateStock(orderId); // Appeler la fonction de mise à jour du stock

            // Créer un enregistrement de transaction
            await Transaction.create({ // Cette création pourrait aussi être dans une transaction avec la mise à jour de stock si besoin critique
              user: order.user,
              order: orderId,
              stripePaymentIntentId: paymentIntentSucceeded.id,
              amount: paymentIntentSucceeded.amount / 100, // Convertir de centimes en devise de base
              currency: paymentIntentSucceeded.currency,
              status: 'succeeded',
              paymentMethodType: paymentIntentSucceeded.payment_method_types ? paymentIntentSucceeded.payment_method_types[0] : undefined,
              metadata: paymentIntentSucceeded.metadata,
              processedAt: new Date(),
            });
            console.log(`Transaction enregistrée pour PaymentIntent ${paymentIntentSucceeded.id}`);

            // Envoyer un email de confirmation de commande
            const User = require('../models/User'); // Assurez-vous que User est importé si pas déjà fait globalement
            const user = await User.findById(order.user);
            if (user) {
              const { sendOrderConfirmationEmail } = require('../utils/emailService');
              await sendOrderConfirmationEmail(user, order);
            } else {
              console.warn(`Webhook: Utilisateur ${order.user} non trouvé pour l'envoi de l'email de confirmation.`);
            }
          } else {
            console.warn(`Webhook: Commande ${orderId} non trouvée pour le PaymentIntent ${paymentIntentSucceeded.id}`);
          }
        } else {
            console.warn(`Webhook: order_id manquant dans les métadonnées du PaymentIntent ${paymentIntentSucceeded.id}`);
        }
      } catch (dbError) {
        console.error(`Webhook: Erreur DB lors de la mise à jour de la commande pour PaymentIntent ${paymentIntentSucceeded.id}:`, dbError);
        // Il est important de quand même renvoyer un 200 à Stripe pour éviter les re-tentatives sur cette erreur,
        // mais de logger l'erreur pour une investigation manuelle.
        // Ou renvoyer un 500 si on veut que Stripe réessaie (avec prudence).
      }
      break;
    case 'payment_intent.payment_failed':
      const paymentIntentFailed = event.data.object;
      console.log('❌ PaymentIntent a échoué:', paymentIntentFailed.id, paymentIntentFailed.last_payment_error?.message);
      // Logique pour notifier l'utilisateur, mettre à jour le statut de la commande, etc.
      // try {
      //   const orderId = paymentIntentFailed.metadata.order_id;
      //   if (orderId && orderId !== 'N/A') {
      //     const order = await Order.findById(orderId);
      //     if (order) {
      //       order.status = 'Paiement échoué';
      //       await order.save();
      //       console.log(`Commande ${orderId} marquée comme paiement échoué.`);
      //       // TODO: Envoyer un email d'échec de paiement à l'utilisateur
      //     }
      //   }
      // } catch (dbError) {
      //    console.error(`Webhook: Erreur DB lors de la mise à jour de la commande pour PaymentIntent échoué ${paymentIntentFailed.id}:`, dbError);
      // }

      // Enregistrer aussi les échecs de transaction
      try {
        const orderIdFailed = paymentIntentFailed.metadata.order_id;
        const orderFailed = orderIdFailed && orderIdFailed !== 'N/A' ? await Order.findById(orderIdFailed) : null;

        await Transaction.create({
          user: orderFailed ? orderFailed.user : (paymentIntentFailed.customer ? paymentIntentFailed.customer : undefined), // Essayer de récupérer l'ID utilisateur
          order: orderIdFailed && orderIdFailed !== 'N/A' ? orderIdFailed : undefined,
          stripePaymentIntentId: paymentIntentFailed.id,
          amount: paymentIntentFailed.amount / 100,
          currency: paymentIntentFailed.currency,
          status: 'failed',
          paymentMethodType: paymentIntentFailed.payment_method_types ? paymentIntentFailed.payment_method_types[0] : undefined,
          metadata: {
            ...(paymentIntentFailed.metadata || {}),
            last_payment_error_code: paymentIntentFailed.last_payment_error?.code,
            last_payment_error_message: paymentIntentFailed.last_payment_error?.message,
          },
          processedAt: new Date(),
        });
        console.log(`Transaction d'échec enregistrée pour PaymentIntent ${paymentIntentFailed.id}`);
      } catch (transactionError) {
        console.error(`Webhook: Erreur lors de l'enregistrement de la transaction d'échec pour ${paymentIntentFailed.id}:`, transactionError);
      }
      break;
    // ... gérer d'autres types d'événements que vous souhaitez écouter
    // Par exemple: 'checkout.session.completed', 'invoice.paid', 'charge.succeeded'
    default:
      console.log(`Événement Stripe non géré: ${event.type}`);
  }

  // Renvoyer une réponse 200 à Stripe pour accuser réception de l'événement
  res.status(200).json({ received: true });
};
