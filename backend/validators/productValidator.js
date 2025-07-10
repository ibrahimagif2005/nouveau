// backend/validators/productValidator.js
const Joi = require('joi');

const productSchema = Joi.object({
  name: Joi.string().min(3).required().messages({
    'string.base': 'Le nom doit être une chaîne de caractères.',
    'string.empty': 'Le nom ne peut pas être vide.',
    'string.min': 'Le nom doit contenir au moins {#limit} caractères.',
    'any.required': 'Le nom est requis.',
  }),
  price: Joi.number().min(0).required().messages({
    'number.base': 'Le prix doit être un nombre.',
    'number.min': 'Le prix doit être supérieur ou égal à {#limit}.',
    'any.required': 'Le prix est requis.',
  }),
  description: Joi.string().optional().allow('').messages({ // Optionnel, peut être une chaîne vide
    'string.base': 'La description doit être une chaîne de caractères.',
  }),
  category: Joi.string().optional().allow('').messages({ // Optionnel
    'string.base': 'La catégorie doit être une chaîne de caractères.',
  }),
  stock: Joi.number().integer().min(0).default(0).messages({
    'number.base': 'Le stock doit être un nombre entier.',
    'number.integer': 'Le stock doit être un nombre entier.',
    'number.min': 'Le stock doit être supérieur ou égal à {#limit}.',
  }),
  imageUrl: Joi.string().uri().optional().allow('').messages({ // Optionnel, doit être une URI valide si fourni
    'string.base': "L'URL de l'image doit être une chaîne de caractères.",
    'string.uri': "L'URL de l'image doit être une URI valide.",
  }),
  featured: Joi.boolean().default(false).messages({
    'boolean.base': 'La valeur de "featured" doit être un booléen.',
  }),
  tags: Joi.array().items(Joi.string()).optional().messages({
    'array.base': 'Les tags doivent être un tableau.',
    'string.base': 'Chaque tag doit être une chaîne de caractères.'
  }),
  variants: Joi.array().items(Joi.object({
    sku: Joi.string().trim().pattern(/^[A-Z0-9-]{3,30}$/).optional().allow(null, '').messages({ // SKU optionnel mais doit être valide s'il est fourni
      'string.pattern.base': 'Le SKU doit être alphanumérique avec des tirets, entre 3 et 30 caractères.'
    }),
    color: Joi.string().trim().optional().allow(null, '').max(50),
    size: Joi.string().trim().optional().allow(null, '').max(50),
    stockSpecific: Joi.number().integer().min(0).default(0),
    priceModifier: Joi.number().default(0)
  })).optional()
  // user: Joi.string().hex().length(24) // Si vous validez l'ID utilisateur (ObjectId MongoDB)
});

const updateProductSchema = Joi.object({
  name: Joi.string().min(3).optional().messages({
    'string.base': 'Le nom doit être une chaîne de caractères.',
    'string.min': 'Le nom doit contenir au moins {#limit} caractères.',
  }),
  price: Joi.number().min(0).optional().messages({
    'number.base': 'Le prix doit être un nombre.',
    'number.min': 'Le prix doit être supérieur ou égal à {#limit}.',
  }),
  description: Joi.string().optional().allow('').messages({
    'string.base': 'La description doit être une chaîne de caractères.',
  }),
  category: Joi.string().optional().allow('').messages({
    'string.base': 'La catégorie doit être une chaîne de caractères.',
  }),
  stock: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Le stock doit être un nombre entier.',
    'number.integer': 'Le stock doit être un nombre entier.',
    'number.min': 'Le stock doit être supérieur ou égal à {#limit}.',
  }),
  imageUrl: Joi.string().uri().optional().allow('').messages({
    'string.base': "L'URL de l'image doit être une chaîne de caractères.",
    'string.uri': "L'URL de l'image doit être une URI valide.",
  }),
  featured: Joi.boolean().optional().messages({
    'boolean.base': 'La valeur de "featured" doit être un booléen.',
  }),
  tags: Joi.array().items(Joi.string()).optional().messages({
    'array.base': 'Les tags doivent être un tableau.',
    'string.base': 'Chaque tag doit être une chaîne de caractères.'
  }),
  // Pour la mise à jour des variantes, la logique peut être complexe:
  // - Remplacer toutes les variantes ?
  // - Mettre à jour des variantes spécifiques par ID/SKU ?
  // - Ajouter/supprimer des variantes ?
  // Pour l'instant, on permet de remplacer le tableau entier des variantes.
  // Une gestion plus fine nécessiterait des routes/logiques dédiées.
  variants: Joi.array().items(Joi.object({
    sku: Joi.string().trim().pattern(/^[A-Z0-9-]{3,30}$/).optional().allow(null, ''),
    color: Joi.string().trim().optional().allow(null, '').max(50),
    size: Joi.string().trim().optional().allow(null, '').max(50),
    stockSpecific: Joi.number().integer().min(0).default(0),
    priceModifier: Joi.number().default(0)
  })).optional()
}).min(1); // Au moins un champ doit être fourni pour la mise à jour


module.exports = { productSchema, updateProductSchema };
