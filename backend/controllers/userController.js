// backend/controllers/userController.js
const User = require('../models/User');
const Order = require('../models/Order'); // Si on veut populer les commandes dans le profil
const Product = require('../models/Product'); // Pour la wishlist
const { AppError } = require('../utils/errorHandler');
const asyncHandler = require('../middlewares/asyncHandler'); // Supposons qu'on a un asyncHandler

// @desc    Récupérer le profil de l'utilisateur connecté
// @route   GET /api/users/profile (remplace /api/auth/me pour la sémantique)
// @access  Private
exports.getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .select('-password -refreshTokens')
    .populate({ // Populer la wishlist avec certains champs du produit
        path: 'wishlist',
        select: 'name price imageUrl category'
    });
    // Les commandes seront récupérées via une route dédiée /api/users/orders

  if (!user) {
    return next(new AppError('Utilisateur non trouvé.', 404));
  }
  res.status(200).json({ success: true, data: user });
});

// @desc    Mettre à jour le profil de l'utilisateur connecté
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { name, email, address } = req.body;
  const updates = {};

  if (name) updates.name = name;
  if (address !== undefined) updates.address = address; // Permettre de vider l'adresse

  // Vérification de l'unicité de l'email si fourni et différent de l'actuel
  if (email && email !== req.user.email) { // req.user est l'utilisateur avant la mise à jour potentielle de l'email
    const existingUser = await User.findOne({ email: email });
    if (existingUser && existingUser._id.toString() !== req.user.id) {
      return next(new AppError('Cet email est déjà utilisé par un autre compte.', 400));
    }
    updates.email = email;
  }

  // TODO: Ajouter une validation Joi pour les updates ici ou dans la route.
  // Pour l'instant, on se fie aux validateurs Mongoose.

  if (Object.keys(updates).length === 0) {
    // Si l'email est le même que l'actuel et que c'est le seul champ envoyé, updates pourrait être vide.
    // On renvoie l'utilisateur actuel dans ce cas ou un message indiquant qu'aucune modif n'a été faite.
    const currentUser = await User.findById(req.user.id).select('-password -refreshTokens');
    return res.status(200).json({ success: true, data: currentUser, message: 'Aucune modification détectée.' });
  }

  const updatedUser = await User.findByIdAndUpdate(req.user.id, { $set: updates }, {
    new: true,
    runValidators: true,
  }).select('-password -refreshTokens');

  if (!updatedUser) {
    return next(new AppError('Utilisateur non trouvé lors de la mise à jour.', 404));
  }
  res.status(200).json({ success: true, data: updatedUser, message: 'Profil mis à jour avec succès.' });
});


// @desc    Ajouter/Retirer un produit de la wishlist
// @route   POST /api/users/wishlist/:productId
// @access  Private
exports.toggleWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return next(new AppError('ID de produit invalide.', 400));
  }

  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Produit non trouvé.', 404));
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError('Utilisateur non trouvé.', 404)); // Devrait être impossible si protect est utilisé
  }

  const productIndex = user.wishlist.indexOf(productId);

  if (productIndex === -1) {
    // Ajouter à la wishlist
    user.wishlist.push(productId);
  } else {
    // Retirer de la wishlist
    user.wishlist.splice(productIndex, 1);
  }

  await user.save({ validateBeforeSave: false }); // Éviter la re-validation du mot de passe, etc.

  // Populer la wishlist avant de la renvoyer pour que le client ait les détails
  await user.populate('wishlist');

  res.status(200).json({
    success: true,
    message: productIndex === -1 ? 'Produit ajouté à la wishlist.' : 'Produit retiré de la wishlist.',
    wishlist: user.wishlist,
  });
});

// @desc    Récupérer la wishlist de l'utilisateur connecté
// @route   GET /api/users/wishlist
// @access  Private
exports.getWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .select('wishlist') // Sélectionner uniquement la wishlist
    .populate({
        path: 'wishlist',
        select: 'name price imageUrl category' // Sélectionner les champs à populer pour chaque produit
    });

  if (!user) {
    return next(new AppError('Utilisateur non trouvé.', 404));
  }
  res.status(200).json({ success: true, data: user.wishlist });
});


// @desc    Récupérer les commandes de l'utilisateur connecté (déplacé ici depuis orderController pour la cohérence /api/users)
// @route   GET /api/users/orders
// @access  Private
exports.getOrdersHistory = asyncHandler(async (req, res, next) => { // Renommée
    const orders = await Order.find({ user: req.user._id })
      .populate('orderItems.product', 'name price imageUrl') // Populer les détails du produit pour chaque item de commande
      .sort({ createdAt: -1 }); // Trier par date de création, les plus récentes en premier

    res.status(200).json({ success: true, count: orders.length, data: orders });
});

// Nécessaire pour productId isValid check
const mongoose = require('mongoose');
