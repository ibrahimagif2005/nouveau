// backend/utils/dbCleaner.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config({ path: __dirname + '/../../.env' }); // Ajustez le chemin si .env est ailleurs

const connectDB = require('../config/db');

// Importer tous les modèles pour pouvoir les parcourir ou les cibler spécifiquement
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
// Ajoutez d'autres modèles ici si nécessaire

const cleanDB = async () => {
  try {
    await connectDB();

    console.log('Nettoyage de la base de données...');

    // Option 1: Supprimer toutes les données de toutes les collections connues
    // Attention: ceci est destructif!
    const models = [User, Product, Order]; // Ajoutez d'autres modèles ici
    for (const model of models) {
      console.log(`Suppression de toutes les données de la collection ${model.collection.name}...`);
      await model.deleteMany({});
      console.log(`Collection ${model.collection.name} nettoyée.`);
    }

    // Option 2: Supprimer des collections spécifiques (si vous ne voulez pas tout effacer)
    // await User.deleteMany({});
    // console.log('Collection Users nettoyée.');
    // await Product.deleteMany({});
    // console.log('Collection Products nettoyée.');
    // await Order.deleteMany({});
    // console.log('Collection Orders nettoyée.');

    console.log('Base de données nettoyée avec succès!');

  } catch (error) {
    console.error('Erreur lors du nettoyage de la base de données:', error);
  } finally {
    mongoose.disconnect();
    console.log('Déconnecté de MongoDB.');
  }
};

// Exécuter la fonction de nettoyage si le script est appelé directement
if (require.main === module) {
  // Demander une confirmation avant de procéder, car c'est une opération destructive
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question(
    'ATTENTION: Cette action va supprimer TOUTES les données des collections Users, Products, et Orders.\n' +
    'Êtes-vous sûr de vouloir continuer? (oui/NON) ',
    answer => {
      if (answer.toLowerCase() === 'oui') {
        console.log('Confirmation reçue. Démarrage du nettoyage...');
        cleanDB();
      } else {
        console.log('Nettoyage annulé.');
        mongoose.disconnect(); // S'assurer de déconnecter si annulé avant connexion
      }
      readline.close();
    }
  );
}

module.exports = cleanDB;
