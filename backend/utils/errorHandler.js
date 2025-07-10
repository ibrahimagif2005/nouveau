// backend/utils/errorHandler.js

// Classe d'erreur personnalisée pour mieux gérer les erreurs avec des codes de statut
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log pour le développeur
  console.error('--------------------');
  console.error('ERROR:', err);
  console.error('--------------------');
  // console.error(err.stack.red); // Pourrait nécessiter un package comme 'colors'

  // Erreur de CastError Mongoose (ID mal formaté)
  if (err.name === 'CastError') {
    const message = `Ressource non trouvée avec l'id ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    error = new ErrorResponse(message, 400); // Bad Request
  }

  // Erreur de duplication de clé Mongoose (ex: email unique)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `La valeur '${value}' pour le champ '${field}' existe déjà. Veuillez en utiliser une autre.`;
    error = new ErrorResponse(message, 400); // Bad Request
  }

  // Erreur JWT: Token invalide
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token invalide, autorisation refusée.';
    error = new ErrorResponse(message, 401); // Unauthorized
  }

  // Erreur JWT: Token expiré
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expiré, autorisation refusée.';
    error = new ErrorResponse(message, 401); // Unauthorized
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Erreur Serveur Interne',
  });
};

module.exports = { errorHandler, ErrorResponse };
