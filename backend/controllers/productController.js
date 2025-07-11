// backend/controllers/productController.js
const Product = require('../models/Product');
const { AppError } = require('../utils/errorHandler');
const logger = require('../utils/logger'); // Importer Winston logger

// @desc    Récupérer tous les produits avec pagination et filtrage/tri de base
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8; // Nombre de produits par page, 8 par défaut
    const skip = (page - 1) * limit;

    // Options de filtrage et de tri (exemples simples)
    let query = {};
    if (req.query.category) {
      query.category = req.query.category;
    }
    // TODO: Ajouter la recherche textuelle ici si q est fourni, en utilisant l'index textuel
    // if (req.query.q) {
    //   query.$text = { $search: req.query.q };
    // }

    let sort = {};
    if (req.query.sortBy && req.query.orderBy) {
      sort[req.query.sortBy] = req.query.orderBy === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // Trier par date de création par défaut
    }

    const products = await Product.find(query)
      .populate('user', 'name') // Optionnel: populer le créateur du produit
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .select('-variants') // Exclure les variantes pour la liste générale pour alléger
      .lean(); // .lean() pour des objets JS simples, plus rapide pour la lecture

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      success: true,
      count: products.length,
      totalProducts,
      totalPages,
      currentPage: page,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rechercher des produits
// @route   GET /api/products/search
// @access  Public
exports.searchProducts = async (req, res, next) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!q) {
      return next(new AppError('Veuillez fournir un terme de recherche (q).', 400));
    }

    // Utilisation de l'index textuel MongoDB standard
    // L'index doit exister sur les champs concernés (name, description, category, tags)
    // productSchema.index({ name: 'text', description: 'text', category: 'text', tags: 'text' }, { weights: { name: 10, category: 7, tags: 5, description: 2 }});
    // (Notre index actuel est { name: 'text', description: 'text', tags: 'text' })
    // Il faudrait recréer l'index si on ajoute 'category' à la recherche textuelle ou ajuster la requête.
    // Pour l'instant, on se base sur l'index existant.

    const query = { $text: { $search: q } };
    const projection = { score: { $meta: "textScore" } }; // Pour pouvoir trier par pertinence

    const products = await Product.find(query, projection)
      .sort({ score: { $meta: "textScore" }, createdAt: -1 }) // Trier par pertinence, puis par date
      .skip(skip)
      .limit(limit)
      .select('name price imageUrl category') // Sélectionner les champs à retourner
      .lean();

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      success: true,
      count: products.length,
      totalProducts,
      totalPages,
      currentPage: page,
      data: products,
    });

  } catch (error) {
    // Gérer les erreurs spécifiques à la recherche textuelle si nécessaire
    if (error.message.includes('Text search failed')) {
        return next(new AppError('Erreur lors de la recherche. Veuillez réessayer.', 500));
    }
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
