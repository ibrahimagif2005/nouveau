// backend/utils/errorHandler.js
const logger = require('./logger'); // Importer le logger Winston

// Classe d'erreur personnalisée pour les erreurs opérationnelles attendues
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Marque l'erreur comme opérationnelle

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Log pour le développeur, plus détaillé pour les erreurs non opérationnelles
  // Utiliser Winston pour logger l'erreur
  // En production, on ne loggue que les erreurs opérationnelles avec un niveau d'alerte plus bas (ex: warn ou info)
  // et les erreurs serveur (non opérationnelles) avec un niveau 'error'.
  if (error.isOperational) {
    // Pour les erreurs attendues (AppError), on peut choisir un niveau moins critique si elles sont fréquentes
    // logger.warn(`${error.statusCode || 500} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    logger.error(`${error.statusCode || 500} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip} - Stack: ${error.stack}`);

  } else {
    // Pour les erreurs de programmation ou autres erreurs inattendues
    logger.error(`500 - Erreur Serveur Interne - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip} - Stack: ${error.stack}`, error);
  }


  // Convertir certaines erreurs Mongoose/JWT en AppError pour une gestion standardisée
  if (err.name === 'CastError') {
    const message = `Ressource non trouvée. Invalide ${err.path}: ${err.value}`;
    error = new AppError(message, 404);
  } else if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message).join('. ');
    error = new AppError(`Données d'entrée invalides. ${messages}`, 400);
  } else if (err.code === 11000) { // Erreur de duplication MongoDB
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `La valeur '${value}' pour le champ '${field}' existe déjà. Veuillez en utiliser une autre.`;
    error = new AppError(message, 400); // Bad Request
  } else if (err.name === 'JsonWebTokenError') {
    error = new AppError('Token invalide. Veuillez vous reconnecter.', 401);
  } else if (err.name === 'TokenExpiredError') {
    error = new AppError('Votre session a expiré. Veuillez vous reconnecter.', 401);
  }

  // Réponse par défaut pour les erreurs non gérées spécifiquement ou non opérationnelles
  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : 'Une erreur serveur est survenue. Veuillez réessayer plus tard.';

  // En mode développement, envoyer plus de détails pour les erreurs non opérationnelles
  if (process.env.NODE_ENV === 'development' && !error.isOperational) {
    return res.status(statusCode).json({
      success: false,
      error: err, // Erreur originale complète
      message: err.message,
      stack: err.stack,
    });
  }

  // Réponse pour la production ou les erreurs opérationnelles
  res.status(statusCode).json({
    success: false,
    message: message,
  });
};

module.exports = { AppError, errorHandler };
