// backend/routes/authRoutes.js
const express = require('express');
const {
  registerUser,
  loginUser,
  getMe,
  refreshAccessToken,
  logoutUser
} = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema } = require('../validators/userValidator');

const router = express.Router();

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.get('/me', protect, getMe);
router.post('/refresh-token', refreshAccessToken); // Pas besoin de 'protect' ici, car on valide le refresh token lui-même
router.post('/logout', protect, logoutUser); // Nécessite d'être connecté (accessToken valide) pour se déconnecter

// Optionnel: route pour révoquer un token spécifique ou tous les tokens d'un utilisateur (admin ou utilisateur lui-même)
// router.post('/revoke-token/:id?', protect, revokeTokenController);

module.exports = router;
