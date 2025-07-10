// backend/utils/seedDatabase.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
// Charger les modèles
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order'); // Si vous voulez aussi seeder des commandes

// Charger les variables d'environnement (si MONGO_URI est dans .env à la racine)
dotenv.config({ path: __dirname + '/../../.env' }); // Ajustez le chemin si .env est ailleurs

const connectDB = require('../config/db');

// Données de seed
const users = [
  { name: 'Admin User', email: 'admin@example.com', password: 'password123', role: 'admin' },
  { name: 'John Doe', email: 'john@example.com', password: 'password123', role: 'user' },
];

const products = [
  {
    name: 'Super Casque Audio Bluetooth',
    price: 79.99,
    description: 'Casque audio sans fil avec réduction de bruit active et son haute fidélité.',
    category: 'Électronique',
    stock: 50,
    imageUrl: 'https://via.placeholder.com/300x200?text=Casque+Audio',
    featured: true,
  },
  {
    name: 'T-Shirt Coton Bio Premium',
    price: 24.99,
    description: 'T-shirt confortable et stylé, fabriqué en coton 100% biologique.',
    category: 'Vêtements',
    stock: 120,
    imageUrl: 'https://via.placeholder.com/300x200?text=T-Shirt+Bio',
  },
  {
    name: 'Machine à Café Espresso Compacte',
    price: 129.99,
    description: 'Préparez un espresso parfait chez vous avec cette machine compacte et facile à utiliser.',
    category: 'Maison',
    stock: 30,
    imageUrl: 'https://via.placeholder.com/300x200?text=Machine+Cafe',
    featured: true,
  },
  {
    name: 'Livre de Cuisine du Monde',
    price: 35.50,
    description: 'Découvrez des recettes authentiques des quatre coins du globe.',
    category: 'Livres',
    stock: 75,
    imageUrl: 'https://via.placeholder.com/300x200?text=Livre+Cuisine',
  }
];

const seedDB = async () => {
  try {
    await connectDB(); // Se connecter à la base de données

    // Nettoyer les collections existantes (optionnel, mais souvent utile pour un seed propre)
    console.log('Nettoyage des collections Users, Products...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({}); // Nettoyer aussi les commandes si vous en seedez

    console.log('Insertion des utilisateurs...');
    const createdUsers = await User.insertMany(users);
    console.log(`${createdUsers.length} utilisateurs insérés.`);

    // Assigner l'admin comme créateur de certains produits (optionnel)
    const adminUser = createdUsers.find(user => user.role === 'admin');
    const productsWithUser = products.map(product => ({
      ...product,
      user: adminUser ? adminUser._id : undefined, // Lier à l'admin si trouvé
    }));

    console.log('Insertion des produits...');
    const createdProducts = await Product.insertMany(productsWithUser);
    console.log(`${createdProducts.length} produits insérés.`);

    // Vous pouvez ajouter ici la création de commandes d'exemple si nécessaire
    // Par exemple, une commande pour John Doe avec le Super Casque Audio
    // const johnDoe = createdUsers.find(user => user.email === 'john@example.com');
    // const casqueAudio = createdProducts.find(p => p.name.includes('Casque Audio'));
    // if (johnDoe && casqueAudio) {
    //   const sampleOrder = {
    //     user: johnDoe._id,
    //     orderItems: [{
    //       product: casqueAudio._id,
    //       name: casqueAudio.name,
    //       quantity: 1,
    //       price: casqueAudio.price,
    //       imageUrl: casqueAudio.imageUrl
    //     }],
    //     shippingAddress: { address: '123 Main St', city: 'Anytown', postalCode: '12345', country: 'USA' },
    //     paymentMethod: 'Stripe',
    //     itemsPrice: casqueAudio.price,
    //     taxPrice: casqueAudio.price * 0.1, // Exemple de taxe
    //     shippingPrice: 5.00,
    //     totalPrice: casqueAudio.price * 1.1 + 5.00,
    //     status: 'Payée',
    //     isPaid: true,
    //     paidAt: new Date()
    //   };
    //   await Order.create(sampleOrder);
    //   console.log('Commande d\'exemple créée.');
    // }


    console.log('Données seedées avec succès!');
  } catch (error) {
    console.error('Erreur lors du seeding de la base de données:', error);
  } finally {
    mongoose.disconnect(); // Se déconnecter après le seeding
    console.log('Déconnecté de MongoDB.');
  }
};

// Exécuter la fonction de seed si le script est appelé directement
if (require.main === module) {
  seedDB();
}

module.exports = seedDB; // Exporter pour une utilisation potentielle ailleurs (tests, etc.)
