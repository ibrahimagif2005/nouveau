// backend/tests/setup.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, {
    // useNewUrlParser: true, // Options dépréciées dans Mongoose 6+
    // useUnifiedTopology: true,
  });
  // console.log(`MongoDB Memory Server started at ${mongoUri}`);
});

afterEach(async () => {
  // Nettoyer toutes les collections après chaque test pour l'isolation
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  // console.log('MongoDB Memory Server stopped.');
});

// Optionnel: Exposer l'instance de l'application Express si elle n'est pas déjà exportée globalement
// const app = require('../server'); // Assurez-vous que server.js exporte l'app pour les tests
// global.app = app;
