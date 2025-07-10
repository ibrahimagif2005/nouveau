// backend/middlewares/validate.js
const Joi = require('joi');
const { AppError } = require('../utils/errorHandler');

/**
 * Middleware pour valider les données de la requête (body, query, params) en utilisant un schéma Joi.
 * @param {Joi.Schema} schema - Le schéma Joi à utiliser pour la validation.
 * @param {'body' | 'query' | 'params'} dataSource - La source des données à valider ('body', 'query', ou 'params').
 */
const validate = (schema, dataSource = 'body') => {
  return (req, res, next) => {
    const dataToValidate = req[dataSource];
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false, // Rapporter toutes les erreurs, pas seulement la première
      stripUnknown: true, // Supprimer les clés inconnues au lieu de les rejeter
      // allowUnknown: false, // Par défaut, les clés inconnues sont interdites si non stripUnknown
    });

    if (error) {
      // Formatter les messages d'erreur pour une meilleure lisibilité
      const errorMessage = error.details.map((detail) => detail.message).join('. ');
      // Utiliser AppError pour une gestion centralisée des erreurs
      return next(new AppError(`Erreur de validation: ${errorMessage}`, 400)); // 400 Bad Request
    }

    // Remplacer les données de la requête (req.body, req.query, req.params) par les données validées et potentiellement transformées par Joi (ex: valeurs par défaut)
    req[dataSource] = value;
    next();
  };
};

module.exports = validate;
