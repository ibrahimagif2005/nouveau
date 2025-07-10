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
  tags: { // Ajout du champ tags
    type: [String],
    index: true // Index simple sur les tags pour le filtrage exact
  },
  variants: [ // Ajout du champ variants
    {
      sku: { type: String, unique: true, sparse: true }, // SKU unique par variante, sparse pour permettre null/undefined si pas de SKU
      color: String,
      size: String,
      stockSpecific: { type: Number, default: 0 }, // Stock spécifique à cette variante
      priceModifier: { type: Number, default: 0 } // Ex: +5€ pour la taille XL ou couleur spéciale
      // D'autres champs spécifiques à la variante peuvent être ajoutés ici
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Index textuel pondéré pour la recherche sur name, description et tags
productSchema.index(
  { name: 'text', description: 'text', tags: 'text' },
  { weights: { name: 10, description: 3, tags: 5 }, name: 'ProductTextSearch' } // Nommer l'index est une bonne pratique
);

// Autres index pour le filtrage et le tri
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ featured: 1 });
// L'index sur `tags` (array) est déjà créé par `index: true` dans la définition du champ,
// utile pour des recherches exactes de tags, différent de l'index textuel.

module.exports = mongoose.model('Product', productSchema);
