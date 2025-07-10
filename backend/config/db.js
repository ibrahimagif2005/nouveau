// backend/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Remplacez par votre URI de connexion MongoDB
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useCreateIndex: true, // N'est plus supporté dans Mongoose 6+
      // useFindAndModify: false // N'est plus supporté dans Mongoose 6+
    });
    console.log(`MongoDB Connecté: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Erreur de connexion MongoDB: ${error.message}`);
    process.exit(1); // Quitter le processus avec échec
  }
};

module.exports = connectDB;
