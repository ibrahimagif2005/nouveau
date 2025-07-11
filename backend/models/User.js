// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Pour le hachage de mot de passe

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Veuillez ajouter un nom'],
  },
  email: {
    type: String,
    required: [true, 'Veuillez ajouter un email'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Veuillez ajouter un email valide',
    ],
  },
  password: {
    type: String,
    required: [true, 'Veuillez ajouter un mot de passe'],
    minlength: 6,
    select: false, // Pour ne pas retourner le mot de passe par défaut lors des requêtes
  },
  role: {
    type: String,
    enum: ['user', 'admin'], // Rôles possibles
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  address: {
    type: String,
    required: false,
  },
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  refreshTokens: [{ // Champ pour stocker les refresh tokens actifs
    token: { type: String, required: true },
    expires: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    deviceInfo: { type: String } // User-Agent ou autre info pour identifier l'appareil/session
    // revokedAt: Date // Optionnel, pour marquer un token comme révoqué explicitement
  }]
});

// Nettoyer les refresh tokens expirés (peut aussi être fait par un job séparé)
userSchema.pre('save', function(next) {
  if (this.isModified('refreshTokens')) {
    this.refreshTokens = this.refreshTokens.filter(rt => rt.expires > new Date());
  }
  next();
});

// Middleware Mongoose pour hacher le mot de passe avant de sauvegarder
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Méthode pour comparer le mot de passe entré avec le mot de passe haché en BDD
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
