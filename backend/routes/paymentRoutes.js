// backend/routes/paymentRoutes.js
const express = require('express');
const { stripePaymentIntent } = require('../controllers/paymentController');
const { protect } = require('../middlewares/auth'); // Protéger la route, seul un utilisateur connecté peut initier un paiement
const validate = require('../middlewares/validate');
const Joi = require('joi');

const router = express.Router();

// Schéma de validation pour la création d'une intention de paiement
const createPaymentIntentSchema = Joi.object({
  orderId: Joi.string().hex().length(24).optional().messages({ // Optionnel si amount est fourni directement
    'string.hex': "L'ID de commande doit être une chaîne hexadécimale valide.",
    'string.length': "L'ID de commande doit avoir une longueur de 24 caractères.",
  }),
  amount: Joi.number().positive().optional().messages({ // Optionnel si orderId est fourni
    'number.base': 'Le montant doit être un nombre.',
    'number.positive': 'Le montant doit être positif.',
  }),
  currency: Joi.string().length(3).lowercase().optional().default('eur').messages({
    'string.length': 'La devise doit être un code à 3 lettres (ex: eur).',
    'string.lowercase': 'La devise doit être en minuscules.'
  })
}).or('orderId', 'amount'); // Au moins orderId ou amount doit être présent

router.post(
  '/create-intent',
  protect, // S'assurer que l'utilisateur est connecté
  validate(createPaymentIntentSchema), // Valider les données d'entrée
  stripePaymentIntent
);

// Route pour les webhooks Stripe (si vous les implémentez)
// Important: Stripe recommande de ne PAS utiliser express.json() pour cette route spécifique,
// mais plutôt `express.raw({type: 'application/json'})` pour vérifier la signature.
const { stripeWebhookHandler } = require('../controllers/paymentController'); // Importer le handler
router.post('/webhook', express.raw({type: 'application/json'}), stripeWebhookHandler);


module.exports = router;
