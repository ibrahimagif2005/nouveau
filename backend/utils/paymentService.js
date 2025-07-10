// backend/utils/paymentService.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Utiliser STRIPE_SECRET_KEY

/**
 * Crée une intention de paiement Stripe.
 * @param {number} amount - Le montant de la transaction en devise de base (ex: euros, dollars).
 * @param {string} currency - La devise de la transaction (ex: 'eur', 'usd').
 * @param {object} metadata - Métadonnées optionnelles à associer à l'intention (ex: order_id).
 * @returns {Promise<object>} L'objet de l'intention de paiement Stripe.
 */
exports.createPaymentIntent = async (amount, currency = 'eur', metadata = {}) => {
  if (!amount || amount <= 0) {
    throw new Error('Le montant doit être positif.');
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("ERREUR: STRIPE_SECRET_KEY n'est pas définie dans les variables d'environnement.");
    throw new Error("La configuration du service de paiement est incomplète.");
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe attend le montant en centimes (ou la plus petite unité de la devise)
      currency: currency,
      metadata: metadata, // Utile pour lier le paiement à une commande dans votre système
      // Vous pouvez ajouter d'autres options ici, comme :
      // payment_method_types: ['card'], // Spécifier les types de paiement acceptés
      // description: 'Achat sur MonEcommerce', // Description pour le relevé Stripe
      // receipt_email: 'customer@example.com', // Email pour envoyer le reçu (si le client est connu à ce stade)
    });
    return paymentIntent;
  } catch (error) {
    console.error("Erreur lors de la création de l'intention de paiement Stripe:", error);
    // Renvoyer une erreur plus générique ou spécifique selon le cas
    throw new Error(`Échec de la création de l'intention de paiement: ${error.message}`);
  }
};

/**
 * (Optionnel) Récupérer les détails d'une intention de paiement.
 * @param {string} paymentIntentId - L'ID de l'intention de paiement.
 * @returns {Promise<object>} L'objet de l'intention de paiement Stripe.
 */
// exports.retrievePaymentIntent = async (paymentIntentId) => {
//   try {
//     const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
//     return paymentIntent;
//   } catch (error) {
//     console.error("Erreur lors de la récupération de l'intention de paiement Stripe:", error);
//     throw new Error(`Échec de la récupération de l'intention de paiement: ${error.message}`);
//   }
// };

// D'autres fonctions pourraient être ajoutées ici, par exemple pour gérer les webhooks Stripe.
// exports.constructWebhookEvent = (payload, sig, endpointSecret) => {
//   return stripe.webhooks.constructEvent(payload, sig, endpointSecret);
// };
