// backend/middlewares/asyncHandler.js

/**
 * Middleware pour envelopper les fonctions de route asynchrones
 * et passer automatiquement les erreurs au gestionnaire d'erreurs global de Express.
 * @param {Function} fn - La fonction de route asynchrone.
 * @returns {Function} Une fonction qui exécute fn et catch les erreurs.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
