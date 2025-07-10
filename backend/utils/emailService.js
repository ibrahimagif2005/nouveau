// backend/utils/emailService.js
const nodemailer = require('nodemailer');

// La configuration du transporteur dépendra de votre fournisseur de messagerie (Gmail, SendGrid, Mailgun, etc.)
// Exemple avec un compte Gmail (moins recommandé pour la production en raison des limites)
// Pour Gmail, vous devrez peut-être activer "Accès moins sécurisé des applications" ou utiliser un mot de passe d'application.
const transporter = nodemailer.createTransport({
  service: 'gmail', // Ou un autre service
  auth: {
    user: process.env.EMAIL_USER, // Votre adresse e-mail
    pass: process.env.EMAIL_PASS, // Votre mot de passe e-mail ou mot de passe d'application
  },
});

// Exemple pour SendGrid (plus robuste pour la production)
// const transporter = nodemailer.createTransport({
//   host: 'smtp.sendgrid.net',
//   port: 587, // ou 465 pour SSL
//   secure: false, // true pour le port 465, false pour les autres
//   auth: {
//     user: 'apikey', // Littéralement 'apikey'
//     pass: process.env.SENDGRID_API_KEY,
//   },
// });

const sendEmail = async (options) => {
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Votre Nom/Application'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER}>`,
    to: options.to, // Destinataire(s)
    subject: options.subject, // Sujet de l'e-mail
    text: options.text, // Corps de l'e-mail en texte brut
    html: options.html, // Corps de l'e-mail en HTML (optionnel, mais souvent préféré)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('E-mail envoyé: %s', info.messageId);
    // info.response contient la réponse du serveur SMTP
    return info;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'e-mail:", error);
    throw error; // Propage l'erreur pour la gérer plus haut si nécessaire
  }
};

module.exports = sendEmail;

/*
Exemple d'utilisation dans un controller :
const sendEmail = require('../utils/emailService');

try {
  await sendEmail({
    to: 'destinataire@example.com',
    subject: 'Test Email',
    text: 'Ceci est un email de test.',
    html: '<h1>Ceci est un email de test</h1><p>Avec du HTML!</p>'
  });
  // Email envoyé avec succès
} catch (error) {
  // Gérer l'erreur d'envoi d'email
}
*/
