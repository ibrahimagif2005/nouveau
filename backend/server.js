// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { errorHandler } = require('./utils/errorHandler');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan'); // HTTP request logger
const logger = require('./utils/logger'); // Winston logger
// const colors = require('colors'); // Optionnel, pour colorer les logs console

// Charger les variables d'environnement depuis .env (s'il existe à la racine du projet global)
// Si .env est dans backend/, ajustez le chemin: dotenv.config({ path: './.env' });
dotenv.config({ path: '../.env' }); // Supposant que .env est à la racine du projet global

// Connexion à la base de données MongoDB
connectDB();

// Importer les routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes'); // Ajout des routes de paiement

const app = express();

// Middlewares de Sécurité
app.use(helmet()); // Définit divers en-têtes HTTP pour la sécurité

// Configuration CORS
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000', // URL de votre client frontend
  credentials: true, // Permet d'envoyer les cookies/authorization headers
};
app.use(cors(corsOptions));

// Middleware pour parser le JSON des requêtes entrantes
// Augmenter la limite de taille si nécessaire, ex: app.use(express.json({ limit: '10kb' }));
app.use(express.json());

// Middleware pour parser les données de formulaire URL-encoded
app.use(express.urlencoded({ extended: true }));

// Rate Limiting - Limiteur de requêtes pour prévenir les abus
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes par `windowMs`
  standardHeaders: true, // Retourne les informations de limite dans les en-têtes `RateLimit-*`
  legacyHeaders: false, // Désactive les en-têtes `X-RateLimit-*` (legacy)
  message: 'Trop de requêtes provenant de cette IP, veuillez réessayer après 15 minutes.',
});
app.use('/api', limiter); // Appliquer le rate limiter à toutes les routes API

// Middleware simple pour logger les requêtes (peut être remplacé par Morgan en production)
// Remplacé par Morgan et Winston
// if (process.env.NODE_ENV === 'development') {
//   app.use((req, res, next) => {
//     console.log(`${req.method} ${req.path}`);
//     next();
//   });
// }

// HTTP request logging avec Morgan, utilisant le stream de Winston
// 'combined' est un format de log standard d'Apache, mais vous pouvez utiliser 'dev', 'short', 'tiny' ou un format personnalisé.
// En production, on pourrait utiliser un format plus concis ou JSON.
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, { stream: logger.stream }));


// Monter les routeurs
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes); // Montage des routes de paiement

// Route de test
app.get('/', (req, res) => {
  res.send('API Ecommerce sécurisée en cours d\'exécution...');
});

// Middleware de gestion des erreurs (doit être le dernier middleware d'application)
app.use(errorHandler);

const PORT = process.env.BACKEND_PORT || process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Serveur démarré en mode ${process.env.NODE_ENV || 'development'} sur le port ${PORT}`//.yellow.bold // Nécessite le package 'colors'
  )
);

// Gérer les rejets de promesse non gérés (erreurs asynchrones non catchées)
process.on('unhandledRejection', (err, promise) => {
  console.error(`ERREUR NON GEREE (Unhandled Rejection): ${err.message}`, err);
  // Fermer le serveur et quitter le processus proprement
  server.close(() => process.exit(1));
});

// Gérer les exceptions non catchées (erreurs synchrones)
process.on('uncaughtException', (err) => {
  console.error(`EXCEPTION NON CATCHEE (Uncaught Exception): ${err.message}`, err);
  server.close(() => process.exit(1));
});
