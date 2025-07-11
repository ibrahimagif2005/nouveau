// backend/controllers/reviewController.js
const Review = require('../models/Review');
const Product = require('../models/Product'); // Pour vérifier que le produit existe
const { AppError } = require('../utils/errorHandler');
const asyncHandler = require('../middlewares/asyncHandler');

// @desc    Créer un nouvel avis pour un produit
// @route   POST /api/products/:productId/reviews
// @access  Private (seul un utilisateur connecté peut laisser un avis)
exports.createReview = asyncHandler(async (req, res, next) => {
  const { rating, title, comment } = req.body;
  const { productId } = req.params;
  const userId = req.user.id; // Depuis le middleware 'protect'

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return next(new AppError('ID de produit invalide.', 400));
  }

  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Produit non trouvé.', 404));
  }

  // Vérifier si l'utilisateur a déjà laissé un avis pour ce produit (logique déjà présente et correcte)
  const existingReview = await Review.findOne({ product: productId, user: userId });
  if (existingReview) {
    return next(new AppError('Vous avez déjà laissé un avis pour ce produit.', 400));
  }

  // Optionnel: Vérifier si l'utilisateur a acheté le produit avant de pouvoir laisser un avis
  // Cette logique nécessiterait de vérifier les commandes de l'utilisateur.
  // const orders = await Order.find({ user: userId, 'orderItems.product': productId, isPaid: true });
  // if (orders.length === 0) {
  //   return next(new AppError('Vous devez avoir acheté ce produit pour laisser un avis.', 403));
  // }

  const review = new Review({
    product: productId,
    user: userId,
    rating,
    title,
    comment,
  });

  await review.save(); // Le post-save hook dans Review.js s'occupera de mettre à jour la note moyenne du produit

  res.status(201).json({
    success: true,
    data: review,
    message: 'Avis créé avec succès.'
  });
});


// @desc    Récupérer tous les avis pour un produit
// @route   GET /api/products/:productId/reviews
// @access  Public
exports.getReviewsForProduct = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5; // Afficher 5 avis par page par défaut
  const skip = (page - 1) * limit;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return next(new AppError('ID de produit invalide.', 400));
  }

  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Produit non trouvé.', 404));
  }

  const reviews = await Review.find({ product: productId })
    .populate('user', 'name') // Populer le nom de l'utilisateur qui a laissé l'avis
    .sort({ createdAt: -1 }) // Les plus récents en premier
    .skip(skip)
    .limit(limit);

  const totalReviews = await Review.countDocuments({ product: productId });
  const totalPages = Math.ceil(totalReviews / limit);

  res.status(200).json({
    success: true,
    count: reviews.length,
    totalReviews,
    totalPages,
    currentPage: page,
    data: reviews,
  });
});

// @desc    Mettre à jour un avis (par son auteur ou un admin)
// @route   PUT /api/reviews/:reviewId
// @access  Private
exports.updateReview = asyncHandler(async (req, res, next) => {
    const { reviewId } = req.params;
    const { rating, title, comment } = req.body; // Champs modifiables

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
        return next(new AppError('ID d\'avis invalide.', 400));
    }

    const review = await Review.findById(reviewId);

    if (!review) {
        return next(new AppError('Avis non trouvé.', 404));
    }

    // Vérifier si l'utilisateur connecté est l'auteur de l'avis ou un admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new AppError('Non autorisé à modifier cet avis.', 403));
    }

    if (rating) review.rating = rating;
    if (title !== undefined) review.title = title; // Permettre de vider le titre
    if (comment) review.comment = comment;

    await review.save(); // Le post-save hook mettra à jour les stats du produit

    res.status(200).json({ success: true, data: review, message: 'Avis mis à jour.' });
});


// @desc    Supprimer un avis (par son auteur ou un admin)
// @route   DELETE /api/reviews/:reviewId
// @access  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
    const { reviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
        return next(new AppError('ID d\'avis invalide.', 400));
    }

    const review = await Review.findById(reviewId);

    if (!review) {
        return next(new AppError('Avis non trouvé.', 404));
    }

    // Vérifier si l'utilisateur connecté est l'auteur de l'avis ou un admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new AppError('Non autorisé à supprimer cet avis.', 403));
    }

    const productId = review.product; // Sauvegarder l'ID produit avant de supprimer l'avis
    await review.deleteOne(); // Utiliser deleteOne() ou remove() sur l'instance

    // Recalculer la note moyenne du produit après suppression
    // Le hook pre/post findOneAnd... dans Review.js devrait gérer cela si on utilise findByIdAndDelete
    // Si on utilise .remove() sur l'instance, le hook 'save' ne se déclenche pas.
    // Il faut donc appeler manuellement la statique ou utiliser un hook 'remove'.
    // Pour simplifier, et comme findByIdAndDelete est plus courant:
    // await Review.calculateAverageRating(productId); // Si on avait utilisé findByIdAndDelete.
    // Avec deleteOne() sur l'instance, on doit aussi appeler la statique manuellement
    // ou ajouter un hook pre('remove') au schéma Review.
    // Pour l'instant, on s'appuie sur le fait que le hook 'post("save")' et 'post("findOneAnd")'
    // sont les principaux. La suppression directe d'instance est moins courante pour déclencher des hooks complexes.
    // Pour une robustesse maximale, un hook `post('remove')` serait bien, ou appeler la statique ici.

    // Pour assurer la mise à jour après suppression:
    await Review.calculateAverageRating(productId);


    res.status(200).json({ success: true, data: {}, message: 'Avis supprimé.' });
});


// Nécessaire pour productId isValid check et ObjectId pour $match
const mongoose = require('mongoose');


// @desc    Vérifier si l'utilisateur connecté a laissé un avis pour un produit
// @route   GET /api/reviews/user-check/:productId  (Ou /api/products/:productId/reviews/user-check)
// @access  Private
exports.checkUserReviewForProduct = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return next(new AppError('ID de produit invalide.', 400));
    }

    const review = await Review.findOne({ product: productId, user: userId });

    if (review) {
        res.status(200).json({ success: true, exists: true, reviewId: review._id });
    } else {
        res.status(200).json({ success: true, exists: false });
    }
});
