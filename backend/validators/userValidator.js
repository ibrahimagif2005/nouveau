// backend/validators/userValidator.js
const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.base': 'Le nom doit être une chaîne de caractères.',
    'string.empty': 'Le nom ne peut pas être vide.',
    'string.min': 'Le nom doit contenir au moins {#limit} caractères.',
    'string.max': 'Le nom ne peut pas dépasser {#limit} caractères.',
    'any.required': 'Le nom est requis.',
  }),
  email: Joi.string().email().required().messages({
    'string.base': "L'email doit être une chaîne de caractères.",
    'string.empty': "L'email ne peut pas être vide.",
    'string.email': "L'email doit être une adresse email valide.",
    'any.required': "L'email est requis.",
  }),
  password: Joi.string().min(6).required().messages({
    'string.base': 'Le mot de passe doit être une chaîne de caractères.',
    'string.empty': 'Le mot de passe ne peut pas être vide.',
    'string.min': 'Le mot de passe doit contenir au moins {#limit} caractères.',
    'any.required': 'Le mot de passe est requis.',
  }),
  role: Joi.string().valid('user', 'admin').optional().messages({ // Optionnel, le modèle a une valeur par défaut
    'string.base': 'Le rôle doit être une chaîne de caractères.',
    'any.only': "Le rôle doit être 'user' ou 'admin'.",
  }),
  address: Joi.string().optional().allow('').max(255).messages({
    'string.base': "L'adresse doit être une chaîne de caractères.",
    'string.max': "L'adresse ne peut pas dépasser {#limit} caractères.",
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.base': "L'email doit être une chaîne de caractères.",
    'string.empty': "L'email ne peut pas être vide.",
    'string.email': "L'email doit être une adresse email valide.",
    'any.required': "L'email est requis.",
  }),
  password: Joi.string().required().messages({
    'string.base': 'Le mot de passe doit être une chaîne de caractères.',
    'string.empty': 'Le mot de passe ne peut pas être vide.',
    'any.required': 'Le mot de passe est requis.',
  }),
});

// Optionnel: Schéma pour la mise à jour du profil utilisateur
const updateUserSchema = Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    email: Joi.string().email().optional(),
    address: Joi.string().optional().allow('').max(255)
    // Ne pas inclure le rôle ou le mot de passe ici, gérer cela séparément si nécessaire
}).min(1); // Au moins un champ doit être fourni

module.exports = { registerSchema, loginSchema, updateUserSchema };
