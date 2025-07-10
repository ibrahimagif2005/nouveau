// backend/controllers/productController.js
const Product = require('../models/Product');
const { AppError } = require('../utils/errorHandler'); // Importer AppError

// @desc    Récupérer tous les produits
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    // const products = await Product.find({}); // Décommentez quand le modèle est prêt
    res.status(200).json({ success: true, count: 0, data: [], message: 'Produits récupérés (placeholder)' });
  } catch (error) {
    next(error);
  }
};

// @desc    Récupérer des recommandations de produits
// @route   GET /api/products/:id/recommendations
// @access  Public
exports.getRecommendations = async (req, res, next) => {
  try {
    const viewedProduct = await Product.findById(req.params.id);

    if (!viewedProduct) {
      return next(new AppError('Produit non trouvé', 404));
    }

    // Recherche des produits similaires :
    // - Même catégorie
    // - Différent du produit actuel
    // - Limité à un certain nombre (ex: 4)
    // - Optionnel: trier par popularité, date d'ajout, ou autre critère pertinent
    const recommendations = await Product.find({
      category: viewedProduct.category,
      _id: { $ne: viewedProduct._id } // Exclure le produit lui-même
    })
    .limit(4) // Nombre de recommandations à retourner
    .select('-variants -attributes -seo -user -description'); // Exclure les champs lourds ou non nécessaires pour une liste de recommandations

    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Récupérer un seul produit par son ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res, next) => {
  try {
    // const product = await Product.findById(req.params.id); // Décommentez
    // if (!product) {
    //   return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    // }
    res.status(200).json({ success: true, data: {id: req.params.id, name: 'Product Placeholder'}, message: 'Produit récupéré (placeholder)' });
  } catch (error) {
    next(error);
  }
};

// @desc    Créer un nouveau produit
// @route   POST /api/products
// @access  Private (Admin)
exports.createProduct = async (req, res, next) => {
  try {
    // const product = await Product.create(req.body); // Décommentez
    res.status(201).json({ success: true, data: req.body, message: 'Produit créé (placeholder)' });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour un produit
// @route   PUT /api/products/:id
// @access  Private (Admin)
exports.updateProduct = async (req, res, next) => {
  try {
    // let product = await Product.findById(req.params.id); // Décommentez
    // if (!product) {
    //   return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    // }
    // product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: {id: req.params.id, ...req.body}, message: 'Produit mis à jour (placeholder)' });
  } catch (error) {
    next(error);
  }
};

// @desc    Supprimer un produit
// @route   DELETE /api/products/:id
// @access  Private (Admin)
exports.deleteProduct = async (req, res, next) => {
  try {
    // const product = await Product.findById(req.params.id); // Décommentez
    // if (!product) {
    //   return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    // }
    // await product.remove();
    res.status(200).json({ success: true, data: {}, message: 'Produit supprimé (placeholder)' });
  } catch (error) {
    next(error);
  }
};
