// backend/routes/authRoutes.js
const express = require('express');
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/auth'); // Middleware d'authentification

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe); // Route protégée

module.exports = router;
