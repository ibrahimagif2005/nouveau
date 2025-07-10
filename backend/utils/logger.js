// backend/utils/logger.js
const winston = require('winston');
const path = require('path');

// Définir le niveau de log en fonction de l'environnement
const level = process.env.NODE_ENV === 'production' ? 'warn' : 'debug';

// Créer le dossier logs s'il n'existe pas (Winston ne le fait pas toujours automatiquement pour tous les transports)
// Ceci est déjà géré par la commande `mkdir backend/logs` mais c'est une bonne pratique de le vérifier ici aussi.
const fs = require('fs');
const logsDir = path.join(__dirname, '../logs'); // Chemin vers backend/logs/
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logger = winston.createLogger({
  level: level, // Niveau de log minimum à enregistrer
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Ajouter un timestamp
    winston.format.errors({ stack: true }), // Logger la stack trace des erreurs
    winston.format.splat(), // Permet d'utiliser des placeholders style printf (logger.info('Message %s', 'valeur'))
    winston.format.json() // Formatter les logs en JSON
  ),
  defaultMeta: { service: 'ecommerce-app-backend' }, // Métadonnées par défaut pour tous les logs
  transports: [
    // Écrire tous les logs de niveau 'error' et inférieur dans `logs/error.log`
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
    }),
    // Écrire tous les logs de niveau 'info' (et par défaut 'warn', 'error') et inférieur dans `logs/app.log`
    // En production, on pourrait vouloir que 'app.log' contienne 'info', 'warn', 'error'.
    // En développement, 'debug' pourrait aussi aller dans 'app.log' ou un fichier séparé 'debug.log'.
    new winston.transports.File({
      filename: path.join(logsDir, 'app.log'),
      // level: 'info', // Si on veut que app.log ne contienne que info et plus critique
    }),
  ],
  // Gérer les exceptions non interceptées avec Winston (optionnel, car on a déjà un process.on('uncaughtException'))
  // exceptionHandlers: [
  //   new winston.transports.File({ filename: path.join(logsDir, 'exceptions.log') })
  // ],
  // Gérer les rejets de promesse non interceptés (optionnel)
  // rejectionHandlers: [
  //   new winston.transports.File({ filename: path.join(logsDir, 'rejections.log') })
  // ]
});

// Si on n'est pas en production, ajouter aussi un transport vers la console
// avec un format plus lisible.
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Colorer la sortie console
        winston.format.simple() // Format simple: `${level}: ${message} ${JSON.stringify(rest)}`
        // Ou un format personnalisé:
        // winston.format.printf(({ level, message, timestamp, stack }) => {
        //   let log = `${timestamp} ${level}: ${message}`;
        //   if (stack) {
        //     log += `\n${stack}`;
        //   }
        //   return log;
        // })
      ),
    })
  );
}

// Créer un flux pour Morgan, qui va écrire dans Winston
logger.stream = {
  write: function (message, encoding) {
    // Utiliser le niveau 'http' pour les logs Morgan, ou 'info' si 'http' n'est pas explicitement géré
    logger.http(message.trim()); // .trim() pour enlever les sauts de ligne ajoutés par Morgan
  },
};

module.exports = logger;
