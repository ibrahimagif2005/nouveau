// backend/tests/products.test.js
const request = require('supertest');
const app = require('../server'); // Assurez-vous que server.js exporte l'app Express
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Variable pour stocker un token d'authentification (si nécessaire pour certaines routes)
let adminToken;
let testProductId;

// Avant tous les tests de ce fichier, connectez-vous en tant qu'admin pour obtenir un token
// et créez des données de test si nécessaire.
beforeAll(async () => {
  // Supprimer les produits existants pour un état de test propre
  await Product.deleteMany({});

  // Créer un utilisateur admin pour les tests de routes protégées (si nécessaire)
  // Pour l'instant, les routes produits GET sont publiques.
  // Si on testait POST /products, il faudrait un token admin.
  // Exemple (nécessiterait User model et une route de login fonctionnelle):
  // const adminCredentials = { email: 'admin-test@example.com', password: 'password123' };
  // await request(app).post('/api/auth/register').send({ ...adminCredentials, name: 'Admin Test', role: 'admin' });
  // const loginRes = await request(app).post('/api/auth/login').send(adminCredentials);
  // adminToken = loginRes.body.accessToken;

  // Créer quelques produits de test
  const productsData = [
    { name: 'Test Product 1', price: 10.99, description: 'Desc 1', category: 'Cat A', stock: 10 },
    { name: 'Test Product 2', price: 20.50, description: 'Desc 2', category: 'Cat B', stock: 5 },
    { name: 'Another Product', price: 5.00, description: 'Desc 3', category: 'Cat A', stock: 0 },
  ];
  const createdProducts = await Product.insertMany(productsData);
  testProductId = createdProducts[0]._id.toString();
});


describe('Product API Endpoints', () => {
  // Test pour GET /api/products
  describe('GET /api/products', () => {
    test('devrait retourner une liste de produits avec succès (200)', async () => {
      const res = await request(app).get('/api/products');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2); // Au moins les produits créés
      expect(res.body.data[0]).toHaveProperty('name');
      expect(res.body.data[0]).toHaveProperty('price');
    });

    test('devrait supporter la pagination (limit)', async () => {
      const res = await request(app).get('/api/products?limit=1');
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.length).toEqual(1);
      expect(res.body.count).toEqual(1);
      expect(res.body.totalPages).toBeGreaterThanOrEqual(2); // Au moins 2 produits au total
    });
  });

  // Test pour GET /api/products/:id
  describe('GET /api/products/:id', () => {
    test('devrait retourner un produit spécifique avec succès (200)', async () => {
      const res = await request(app).get(`/api/products/${testProductId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id', testProductId);
      expect(res.body.data.name).toEqual('Test Product 1');
    });

    test('devrait retourner une erreur 404 si l\'ID du produit n\'existe pas', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).get(`/api/products/${fakeId}`);
      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Produit non trouvé/i);
    });

    test('devrait retourner une erreur 400 si l\'ID du produit est invalide', async () => {
      const invalidId = 'invalid-id-format';
      const res = await request(app).get(`/api/products/${invalidId}`);
      expect(res.statusCode).toEqual(400); // Ou 404 selon la gestion de CastError
      expect(res.body.success).toBe(false);
      // Le message exact dépend de la validation Joi vs CastError Mongoose
      // expect(res.body.message).toMatch(/ID doit être une chaîne hexadécimale/i);
    });
  });

  // Test pour POST /api/products (nécessite authentification admin)
  // describe('POST /api/products', () => {
  //   test('devrait créer un nouveau produit si admin authentifié (201)', async () => {
  //     const newProduct = { name: 'New Super Product', price: 99.99, category: 'NewCat', stock: 100, description: 'Super desc' };
  //     const res = await request(app)
  //       .post('/api/products')
  //       .set('Authorization', `Bearer ${adminToken}`) // Nécessite un adminToken valide
  //       .send(newProduct);
  //     expect(res.statusCode).toEqual(201);
  //     expect(res.body.success).toBe(true);
  //     expect(res.body.data).toHaveProperty('_id');
  //     expect(res.body.data.name).toEqual(newProduct.name);
  //   });

  //   test('devrait retourner une erreur 401 si non authentifié', async () => {
  //     const newProduct = { name: 'Unauthorized Product', price: 1.00 };
  //     const res = await request(app).post('/api/products').send(newProduct);
  //     expect(res.statusCode).toEqual(401);
  //   });

  //   // Ajouter des tests pour la validation des données (Joi)
  //   test('devrait retourner une erreur 400 si les données sont invalides', async () => {
  //       const invalidProduct = { name: 'Sh', price: -10 }; // Nom trop court, prix négatif
  //       const res = await request(app)
  //         .post('/api/products')
  //         .set('Authorization', `Bearer ${adminToken}`)
  //         .send(invalidProduct);
  //       expect(res.statusCode).toEqual(400);
  //       expect(res.body.success).toBe(false);
  //       expect(res.body.message).toContain("Le nom doit contenir au moins 3 caractères"); // Exemple de message Joi
  //       expect(res.body.message).toContain("Le prix doit être supérieur ou égal à 0");
  //   });
  // });

  // TODO: Ajouter des tests pour PUT et DELETE /api/products/:id (nécessitent adminToken)

  // Test pour GET /api/products/search
  describe('GET /api/products/search', () => {
    test('devrait retourner des résultats de recherche avec succès (200)', async () => {
      // Mocker Product.aggregate pour simuler une réponse d'Atlas Search
      const mockSearchResults = [
        { _id: 'searchResult1', name: 'Searched Product Alpha', price: 15.00, category: 'Cat A', score: 1.5 },
        { _id: 'searchResult2', name: 'Searched Product Beta', price: 25.00, category: 'Cat B', score: 1.2 }
      ];
      const mockAggregateResponse = [{
        paginatedResults: mockSearchResults,
        totalCount: [{ count: mockSearchResults.length }]
      }];

      Product.aggregate = jest.fn().mockResolvedValue(mockAggregateResponse);

      const res = await request(app).get('/api/products/search?q=testsearch');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(expect.arrayContaining(
        mockSearchResults.map(p => expect.objectContaining({ name: p.name }))
      ));
      expect(res.body.totalProducts).toEqual(mockSearchResults.length);
      expect(Product.aggregate).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          $search: expect.objectContaining({ index: "ecommerce_search" })
        })
      ]));
    });

    test('devrait retourner une erreur 400 si le paramètre q est manquant', async () => {
      const res = await request(app).get('/api/products/search');
      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Veuillez fournir un terme de recherche/i);
    });
  });

  // TODO: Ajouter des tests pour les recommandations /api/products/:id/recommendations
});

// Nettoyer après tous les tests de ce fichier
afterAll(async () => {
  await Product.deleteMany({});
});
