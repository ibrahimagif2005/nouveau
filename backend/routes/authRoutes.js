// backend/routes/authRoutes.js
const express = require('express');
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/auth'); // Middleware d'authentification
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema } = require('../validators/userValidator');

const router = express.Router();

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.get('/me', protect, getMe); // Route protégée

module.exports = router;
