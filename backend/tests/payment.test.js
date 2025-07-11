// backend/tests/payment.test.js
const request = require('supertest');
const app = require('../server'); // Assurez-vous que server.js exporte l'app Express
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

describe('Payment Process Integration Test', () => {
  let testUser;
  let userToken;
  let testProduct1;
  let testProduct2;

  beforeAll(async () => {
    // Nettoyer les collections
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});

    // 1. Créer un utilisateur de test
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User for Payment',
        email: 'paymenttest@example.com',
        password: 'password123',
      });
    // console.log('Register response:', userResponse.body); // Debug
    // L'enregistrement ne connecte pas directement, donc il faut se connecter
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'paymenttest@example.com',
        password: 'password123',
      });
    // console.log('Login response:', loginResponse.body); // Debug
    userToken = loginResponse.body.accessToken;
    testUser = loginResponse.body.user; // Récupérer l'objet utilisateur avec son _id

    expect(userToken).toBeDefined();
    expect(testUser).toBeDefined();
    expect(testUser).toHaveProperty('_id');


    // Créer des produits de test (si les routes de création de produit sont protégées, il faudrait un token admin)
    // Pour ce test, on va les créer directement en BDD pour simplifier,
    // ou supposer que la route POST /api/products est accessible pour un user authentifié (ce qui n'est pas le cas, elle est admin-only)
    // Solution: Créer directement en BDD pour ce test spécifique de paiement.
    testProduct1 = await new Product({ name: 'Payment Test Product 1', price: 10.00, category: 'Test', stock: 5, description: 'Desc P1' }).save();
    testProduct2 = await new Product({ name: 'Payment Test Product 2', price: 25.50, category: 'Test', stock: 3, description: 'Desc P2' }).save();
  });

  test('devrait compléter le processus de création de commande et d\'intention de paiement', async () => {
    if (!userToken || !testUser || !testProduct1 || !testProduct2) {
      throw new Error('Setup incomplet pour le test de paiement. Utilisateur, token ou produits manquants.');
    }

    const testOrderData = {
      orderItems: [
        { product: testProduct1._id.toString(), quantity: 1 }, // S'assurer que product est un ID string
        { product: testProduct2._id.toString(), quantity: 2 },
      ],
      shippingAddress: {
        address: '123 Test St',
        city: 'Testville',
        postalCode: '12345',
        country: 'Testland',
      },
      // paymentMethod sera 'Stripe' par défaut dans le backend
    };

    // 2. Créer une commande
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send(testOrderData);

    // console.log('Order creation response:', orderRes.body); // Debug
    // console.log('Order creation error (if any):', orderRes.error); // Debug

    expect(orderRes.statusCode).toBe(201);
    expect(orderRes.body.success).toBe(true);
    expect(orderRes.body).toHaveProperty('order');
    expect(orderRes.body.order).toHaveProperty('_id');
    expect(orderRes.body).toHaveProperty('clientSecret'); // Vérifier que le clientSecret est retourné
    expect(orderRes.body.clientSecret).toMatch(/^pi_[a-zA-Z0-9]+_secret_[a-zA-Z0-9]+$/); // Format typique du clientSecret Stripe

    const createdOrder = orderRes.body.order;

    // 3. (Optionnel ici) Simuler l'appel à /api/payment/create-intent si c'était une étape séparée.
    // Dans notre cas, create-intent est intégré à la création de commande.
    // Le test vérifie déjà que clientSecret est renvoyé par POST /api/orders.

    // Vérifier que la commande a été créée avec les bonnes informations
    const orderInDb = await Order.findById(createdOrder._id);
    expect(orderInDb).not.toBeNull();
    expect(orderInDb.user.toString()).toEqual(testUser._id.toString());
    expect(orderInDb.orderItems.length).toBe(2);
    expect(orderInDb.status).toEqual('En attente de paiement');

    // Le total est calculé côté serveur: (1 * 10.00) + (2 * 25.50) = 10.00 + 51.00 = 61.00 (itemsPrice)
    // Plus taxes et livraison (ex: 10% taxe, 5€ livraison)
    // itemsPrice = 61.00
    // taxPrice = 6.10
    // shippingPrice = 5.00 (car 61.00 < 100)
    // totalPrice = 61.00 + 6.10 + 5.00 = 72.10
    expect(orderInDb.totalPrice).toBeCloseTo(72.10);
  });

  // TODO: Ajouter des tests pour le webhook Stripe (nécessiterait de mocker Stripe et simuler un événement webhook)

  afterAll(async () => {
    // Nettoyer après tous les tests
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
  });
});
