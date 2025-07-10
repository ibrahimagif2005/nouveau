// backend/controllers/productController.js
const Product = require('../models/Product'); // Assurez-vous que le chemin est correct

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
