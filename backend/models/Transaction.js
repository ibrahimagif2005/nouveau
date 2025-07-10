// backend/models/Transaction.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema(
  {
    user: { // L'utilisateur qui a effectué la transaction (si applicable, peut être null pour des transactions système)
      type: Schema.Types.ObjectId,
      ref: 'User',
      // required: true, // Peut ne pas être requis si la transaction n'est pas directement liée à un utilisateur connecté
    },
    order: { // La commande associée à cette transaction (si applicable)
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
    stripePaymentIntentId: { // L'ID de l'intention de paiement Stripe (ou autre ID de transaction du PSP)
      type: String,
      required: true,
      unique: true, // Chaque intention de paiement doit avoir une seule transaction enregistrée
      index: true,
    },
    amount: { // Montant de la transaction (en devise de base, ex: euros)
      type: Number,
      required: true,
    },
    currency: { // Devise de la transaction (ex: 'eur', 'usd')
      type: String,
      required: true,
      uppercase: true,
    },
    status: { // Statut de la transaction
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'canceled', 'refunded', 'partially_refunded'],
      required: true,
      default: 'pending',
    },
    paymentMethodType: { // Type de méthode de paiement (ex: 'card', 'sepa_debit')
        type: String,
    },
    metadata: { // Métadonnées supplémentaires (peut stocker des infos de Stripe ou des infos internes)
      type: Map,
      of: Schema.Types.Mixed, // Permet de stocker des objets avec des clés/valeurs dynamiques
    },
    // Champs pour gérer les remboursements si nécessaire
    // amountRefunded: { type: Number, default: 0 },
    // refunds: [
    //   {
    //     stripeRefundId: String,
    //     amount: Number,
    //     reason: String,
    //     createdAt: Date,
    //   }
    // ],
    processedAt: { // Date à laquelle l'événement de webhook a été traité par notre système
        type: Date,
        default: Date.now
    }
  },
  {
    timestamps: true, // Ajoute createdAt (quand l'enregistrement est créé) et updatedAt
  }
);

// Index pour rechercher rapidement les transactions d'une commande ou d'un utilisateur
transactionSchema.index({ order: 1 });
transactionSchema.index({ user: 1 });
transactionSchema.index({ status: 1 });


const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
