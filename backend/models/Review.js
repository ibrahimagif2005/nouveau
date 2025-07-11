// backend/models/Review.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Un avis doit être associé à un produit.'],
    index: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Un avis doit être associé à un utilisateur.'],
  },
  rating: {
    type: Number,
    min: [1, 'La note doit être au minimum de 1.'],
    max: [5, 'La note doit être au maximum de 5.'],
    required: [true, 'Une note est requise.'],
  },
  title: { // Optionnel
    type: String,
    trim: true,
    maxlength: [100, 'Le titre ne doit pas dépasser 100 caractères.'],
  },
  comment: {
    type: String,
    trim: true,
    required: [true, 'Un commentaire est requis.'],
    maxlength: [1000, 'Le commentaire ne doit pas dépasser 1000 caractères.'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // updatedAd: timestamps: true gérera cela
}, {
  timestamps: true // Ajoute createdAt et updatedAt
});

// Empêcher un utilisateur de laisser plusieurs avis pour le même produit
reviewSchema.index({ product: 1, user: 1 }, { unique: true });


// Méthode statique pour calculer la note moyenne et le nombre d'avis pour un produit
reviewSchema.statics.calculateAverageRating = async function(productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId }
    },
    {
      $group: {
        _id: '$product',
        numReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' }
      }
    }
  ]);

  try {
    if (stats.length > 0) {
      await mongoose.model('Product').findByIdAndUpdate(productId, {
        averageRating: parseFloat(stats[0].averageRating.toFixed(1)), // Arrondir à une décimale
        numReviews: stats[0].numReviews
      });
    } else {
      // S'il n'y a plus d'avis, réinitialiser les stats du produit
      await mongoose.model('Product').findByIdAndUpdate(productId, {
        averageRating: 0,
        numReviews: 0
      });
    }
  } catch (err) {
    console.error('Erreur lors de la mise à jour de la note moyenne du produit:', err);
  }
};

// Appeler calculateAverageRating après chaque sauvegarde (création/maj) ou suppression d'un avis
reviewSchema.post('save', function() {
  // this.constructor est le modèle (Review)
  // this.product est l'ID du produit de l'avis qui vient d'être sauvegardé
  this.constructor.calculateAverageRating(this.product);
});

// Appeler aussi pour findByIdAndUpdate et findByIdAndDelete (via un middleware pre sur la requête)
// Pour findOneAndRemove ou findOneAndDelete, le 'this' dans le post middleware est la requête, pas le document.
reviewSchema.pre(/^findOneAnd/, async function(next) {
  // Stocker le document qui va être modifié/supprimé pour y accéder dans le post middleware
  // this.getQuery() retourne les conditions de la requête
  this.r = await this.clone().findOne(); // this.clone() pour exécuter une nouvelle requête sans affecter l'originale
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  // this.r est le document tel qu'il était avant la modification/suppression
  // this.r.constructor est le modèle si this.r existe
  if (this.r) {
    await this.r.constructor.calculateAverageRating(this.r.product);
  }
});


const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
