// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { errorHandler } = require('./utils/errorHandler');
// const colors = require('colors'); // Optionnel, pour colorer les logs console

// Charger les variables d'environnement depuis .env (s'il existe)
dotenv.config(); // Par défaut, cherche un fichier .env à la racine

// Connexion à la base de données MongoDB
connectDB();

// Importer les routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// Middleware pour parser le JSON des requêtes entrantes
app.use(express.json());

// Middleware pour parser les données de formulaire URL-encoded
app.use(express.urlencoded({ extended: true }));

// Middleware simple pour logger les requêtes (peut être remplacé par Morgan)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Monter les routeurs
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Route de test
app.get('/', (req, res) => {
  res.send('API Ecommerce en cours d\'exécution...');
});

// Middleware de gestion des erreurs (doit être le dernier middleware)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Serveur démarré en mode ${process.env.NODE_ENV || 'development'} sur le port ${PORT}`//.yellow.bold // Nécessite le package 'colors'
  )
);

// Gérer les rejets de promesse non gérés
process.on('unhandledRejection', (err, promise) => {
  console.error(`Erreur non gérée: ${err.message}`.red); // Nécessite 'colors'
  // Fermer le serveur et quitter le processus
  server.close(() => process.exit(1));
});
