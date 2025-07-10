// backend/models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: 'User',
    },
    orderItems: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        imageUrl: { type: String }, // Optionnel, mais bien pour le récapitulatif
        price: { type: Number, required: true },
        product: { // Référence au produit commandé
          type: mongoose.Schema.ObjectId,
          required: true,
          ref: 'Product',
        },
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
      default: 'Stripe', // Ou PayPal, etc.
    },
    paymentResult: { // Pour stocker les infos de paiement (ex: de Stripe)
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    itemsPrice: { // Prix total des articles avant taxes et livraison
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: { // Prix total final
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['En attente de paiement', 'Payée', 'En cours de traitement', 'Expédiée', 'Livrée', 'Annulée'],
      default: 'En attente de paiement',
      required: true,
    },
  },
  {
    timestamps: true, // Ajoute createdAt et updatedAt automatiquement
  }
);

// Index pour retrouver rapidement les commandes d'un utilisateur
orderSchema.index({ user: 1 });
// Index pour filtrer/trier par statut de commande
orderSchema.index({ status: 1 });
// Index pour les commandes payées et non livrées (potentiellement utile pour un dashboard admin)
orderSchema.index({ isPaid: 1, isDelivered: 1 });


module.exports = mongoose.model('Order', orderSchema);
