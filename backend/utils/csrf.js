// backend/utils/csrf.js
const csurf = require('csurf');

// Configuration de la protection CSRF
// Le token secret sera stocké dans un cookie.
const csrfProtection = csurf({
  cookie: {
    httpOnly: true, // Le cookie n'est pas accessible via JavaScript côté client
    sameSite: 'strict', // Le cookie ne sera envoyé que pour les requêtes provenant du même site
    secure: process.env.NODE_ENV === 'production', // Mettre à true en production (nécessite HTTPS)
    // maxAge: 3600 // Optionnel: durée de vie du cookie CSRF en secondes (ex: 1 heure)
  }
});

// Middleware pour vérifier le token CSRF sur les routes qui modifient l'état
// Ce middleware sera appliqué globalement ou sur des routes spécifiques.
// csurf s'attend à ce que le token soit dans req.body._csrf, req.query._csrf, ou req.headers['csrf-token'], req.headers['xsrf-token'], req.headers['x-csrf-token'], req.headers['x-xsrf-token'].
const verifyCsrf = csrfProtection;


// Middleware pour générer et attacher un token CSRF à la réponse (si nécessaire pour le client)
// Pour les SPA, on aura un endpoint dédié pour récupérer ce token.
// Pour les formulaires traditionnels, on l'injecterait dans le formulaire.
const generateCsrfTokenForResponse = (req, res, next) => {
  // Le token est disponible via req.csrfToken() après que le middleware csurf (csrfProtection) a été exécuté.
  // On le met dans res.locals pour qu'il soit potentiellement utilisable par des templates côté serveur,
  // mais pour une SPA, on l'exposera via un endpoint dédié.
  res.locals.csrfToken = req.csrfToken();
  next();
};


module.exports = {
  verifyCsrf, // Middleware principal de csurf pour la vérification
  // generateCsrfTokenForResponse // Ce middleware est moins utile pour SPA, on utilisera un endpoint direct
};
