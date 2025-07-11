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
const cookieParser = require('cookie-parser'); // Pour parser les cookies, nécessaire pour csurf
const { verifyCsrf } = require('./utils/csrf'); // Middleware CSRF
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
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes'); // Ajout des routes pour les avis

const app = express();

// Middlewares de Sécurité
// Configuration Helmet plus spécifique, notamment pour CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"], // Par défaut, n'autorise que les ressources du même domaine
        scriptSrc: [
          "'self'",
          // Ajoutez ici les CDN de confiance si vous en utilisez pour des scripts JS
          // Par exemple: 'https://cdnjs.cloudflare.com', 'https://unpkg.com', etc.
          // Pour l'instant, on reste strict avec 'self'
          // Si vous utilisez des scripts inline (non recommandé), vous auriez besoin de 'unsafe-inline' ou mieux, des hashes/nonces
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'", // Souvent nécessaire pour les styles injectés par des bibliothèques JS ou Tailwind en dev. À revoir pour la production.
          // Ajoutez ici les CDN de confiance pour les CSS (ex: Google Fonts)
          // 'https://fonts.googleapis.com'
        ],
        imgSrc: ["'self'", "data:", "https://via.placeholder.com"], // Autorise les images du domaine, data URI, et placeholder.com
        fontSrc: ["'self'"], // Ajoutez 'https://fonts.gstatic.com' si vous utilisez Google Fonts
        connectSrc: [
          "'self'", // Autorise les connexions vers le propre domaine (pour les API internes)
          // Ajoutez ici les domaines externes auxquels votre backend pourrait avoir besoin de se connecter (ex: API Stripe)
          // 'https://api.stripe.com'
        ],
        frameSrc: ["'self'"], // Domaines autorisés pour les iframes (ex: Captcha, Stripe Elements)
        objectSrc: ["'none'"], // Désactive les plugins comme Flash
        upgradeInsecureRequests: [], // Redirige HTTP vers HTTPS (si le proxy gère déjà SSL, cela peut être redondant)
      },
    },
    // Autres configurations Helmet que vous pourriez vouloir ajuster :
    // crossOriginEmbedderPolicy: false, // Mettre à true si vous n'utilisez pas de COEP, sinon peut casser des choses
    // crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    // originAgentCluster: true,
  })
);


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
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, { stream: logger.stream }));

// Middleware pour parser les cookies
app.use(cookieParser());

// Middleware de protection CSRF - il doit être configuré APRÈS cookieParser et les middlewares de session (si utilisés)
// Et AVANT les routeurs qui gèrent les requêtes modifiant l'état.
// Pour les API SPA, on expose un endpoint pour obtenir le token, et le client l'envoie dans un header.
// csurf va vérifier ce header.
app.use(verifyCsrf);

// Route spéciale pour que le client SPA récupère le token CSRF
app.get('/api/csrf-token', (req, res) => {
  // req.csrfToken() est une fonction ajoutée par csurf pour générer un token.
  // Ce token doit être stocké par le client et envoyé dans un en-tête XSRF-TOKEN (ou autre configuré) pour les requêtes POST/PUT/DELETE etc.
  res.json({ csrfToken: req.csrfToken() });
});

// Gérer les erreurs CSRF spécifiquement (optionnel mais recommandé pour un meilleur feedback)
// Ce gestionnaire d'erreurs doit être placé APRÈS app.use(verifyCsrf) et AVANT votre gestionnaire d'erreurs global.
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    logger.warn(`Tentative CSRF détectée: ${err.message} - IP: ${req.ip} - URL: ${req.originalUrl}`);
    res.status(403).json({ success: false, message: 'Protection CSRF: Token invalide ou manquant.' });
  } else {
    next(err);
  }
});

// Monter les routeurs
// Les routes qui modifient l'état (POST, PUT, DELETE, PATCH) seront protégées par csurf.
// Les routes GET ne sont généralement pas protégées par CSRF, mais csurf ne les bloque pas par défaut.
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes); // Montage des routes pour les avis (pour PUT/DELETE sur /api/reviews/:reviewId)

// Route de test
app.get('/', (req, res) => {
  res.send('API Ecommerce sécurisée en cours d\'exécution...');
});

// Middleware de gestion des erreurs global (doit être le dernier middleware d'application)
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
