// backend/validators/reviewValidator.js
const Joi = require('joi');

const reviewSchemaValidation = Joi.object({
  rating: Joi.number().min(1).max(5).required().messages({
    'number.base': 'La note doit être un nombre.',
    'number.min': 'La note doit être au minimum de {#limit}.',
    'number.max': 'La note doit être au maximum de {#limit}.',
    'any.required': 'Une note est requise.',
  }),
  title: Joi.string().max(100).optional().allow('').messages({
    'string.max': 'Le titre ne doit pas dépasser {#limit} caractères.',
  }),
  comment: Joi.string().min(10).max(1000).required().messages({
    'string.base': 'Le commentaire doit être une chaîne de caractères.',
    'string.min': 'Le commentaire doit contenir au moins {#limit} caractères.',
    'string.max': 'Le commentaire ne doit pas dépasser {#limit} caractères.',
    'any.required': 'Un commentaire est requis.',
  })
});

module.exports = { reviewSchemaValidation };
