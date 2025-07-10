// backend/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Veuillez ajouter un nom pour le produit'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Veuillez ajouter un prix pour le produit'],
  },
  description: {
    type: String,
    required: [false, 'La description est optionnelle'], // Rendu optionnel
  },
  category: {
    type: String,
    required: [false, 'La catégorie est optionnelle'], // Rendu optionnel
  },
  stock: {
    type: Number,
    required: [true, 'Veuillez ajouter le stock disponible'],
    default: 0,
  },
  imageUrl: {
    type: String,
    required: [false, "L'URL de l'image est optionnelle"], // Rendu optionnel
  },
  // Vous pouvez ajouter d'autres champs comme les avis, les notes, etc.
  // par exemple:
  // reviews: [reviewSchema], // Nécessiterait un reviewSchema séparé
  // rating: { type: Number, default: 0 },
  // numReviews: { type: Number, default: 0 },
  user: { // Pour savoir quel admin/utilisateur a créé le produit, si nécessaire
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    // required: true // Décommentez si un produit doit toujours être lié à un utilisateur
  },
  featured: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Product', productSchema);
