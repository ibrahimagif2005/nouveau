// backend/utils/emailService.js
const sgMail = require('@sendgrid/mail');
const logger = require('./logger'); // Utiliser notre logger Winston

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const defaultFromName = process.env.EMAIL_FROM_NAME || 'Votre Boutique Ecommerce';
const defaultFromEmail = process.env.EMAIL_FROM_ADDRESS || 'noreply@example.com'; // Doit être un domaine vérifié sur SendGrid

/**
 * Envoie un email générique.
 * @param {object} options - Options pour l'email.
 * @param {string} options.to - Adresse email du destinataire.
 * @param {string} options.subject - Sujet de l'email.
 * @param {string} options.text - Contenu texte de l'email.
 * @param {string} options.html - Contenu HTML de l'email.
 * @param {string} [options.fromEmail=defaultFromEmail] - Adresse email de l'expéditeur.
 * @param {string} [options.fromName=defaultFromName] - Nom de l'expéditeur.
 */
const sendEmail = async ({ to, subject, text, html, fromEmail = defaultFromEmail, fromName = defaultFromName }) => {
  if (!process.env.SENDGRID_API_KEY) {
    logger.error('SENDGRID_API_KEY non configurée. Impossible d\'envoyer des emails.');
    // En développement, on pourrait juste logguer l'email au lieu de le bloquer.
    // Pour la production, c'est une erreur critique si les emails sont importants.
    if (process.env.NODE_ENV === 'production') {
        throw new Error('Configuration email manquante côté serveur.');
    } else {
        logger.info(`Email de développement (non envoyé) : À: ${to}, Sujet: ${subject}, HTML: ${html}`);
        return { messageId: 'dev-email-not-sent-' + Date.now() };
    }
  }

  const msg = {
    to,
    from: {
        name: fromName,
        email: fromEmail,
    },
    subject,
    text, // SendGrid utilisera text si html n'est pas fourni, ou pour les clients mail ne supportant pas HTML
    html,
  };

  try {
    const response = await sgMail.send(msg);
    logger.info(`Email envoyé à ${to} avec succès. Sujet: ${subject}. Message ID: ${response[0]?.headers['x-message-id']}`);
    return response;
  } catch (error) {
    logger.error(`Erreur lors de l'envoi de l'email à ${to} (Sujet: ${subject}):`, error.response ? error.response.body : error);
    // Ne pas propager l'erreur pour ne pas bloquer le flux principal (ex: création de commande)
    // mais s'assurer que c'est loggué pour investigation.
    // throw error; // Décommentez si l'échec d'envoi d'email doit être une erreur bloquante.
    return null; // Indiquer un échec sans bloquer
  }
};

/**
 * Envoie un email de confirmation de commande.
 * @param {object} user - L'objet utilisateur (contenant au moins `email` et `name`).
 * @param {object} order - L'objet commande (contenant au moins `_id`, `totalPrice`, `orderItems`).
 */
exports.sendOrderConfirmationEmail = async (user, order) => {
  if (!user || !user.email || !order) {
    logger.error('sendOrderConfirmationEmail: Données utilisateur ou commande manquantes.');
    return;
  }

  // Construction simple du contenu HTML de l'email
  // Pour des emails plus complexes, utilisez des templates (ex: Handlebars, EJS, ou des services comme SendGrid Templates)
  let itemsHtml = '<ul>';
  order.orderItems.forEach(item => {
    itemsHtml += `<li>${item.name} (Quantité: ${item.quantity}) - ${(item.price * item.quantity).toFixed(2)} €</li>`;
  });
  itemsHtml += '</ul>';

  const htmlContent = `
    <h1>Merci pour votre commande, ${user.name || 'Client'} !</h1>
    <p>Votre commande #${order._id} d'un montant total de <strong>${order.totalPrice.toFixed(2)} €</strong> a bien été reçue et est en cours de traitement.</p>
    <h2>Détails de la commande :</h2>
    ${itemsHtml}
    <p>Vous recevrez un autre email lorsque votre commande sera expédiée.</p>
    <p>Merci de faire confiance à ${defaultFromName}.</p>
  `;
  const textContent = `
    Merci pour votre commande, ${user.name || 'Client'} !
    Votre commande #${order._id} d'un montant total de ${order.totalPrice.toFixed(2)} € a bien été reçue et est en cours de traitement.
    Détails de la commande :
    ${order.orderItems.map(item => `${item.name} (Quantité: ${item.quantity}) - ${(item.price * item.quantity).toFixed(2)} €`).join('\n')}
    Vous recevrez un autre email lorsque votre commande sera expédiée.
    Merci de faire confiance à ${defaultFromName}.
  `;

  try {
    await sendEmail({
      to: user.email,
      subject: `Confirmation de votre commande #${order._id} chez ${defaultFromName}`,
      text: textContent,
      html: htmlContent,
    });
  } catch (error) {
    // L'erreur est déjà logguée par sendEmail
    logger.error(`Échec de l'envoi de l'email de confirmation pour la commande ${order._id} à ${user.email}`);
  }
};


// Exporter sendEmail si on veut l'utiliser pour d'autres types d'emails
module.exports.sendGenericEmail = sendEmail;

/**
 * Envoie un email de réinitialisation de mot de passe.
 * @param {string} email - Adresse email du destinataire.
 * @param {string} token - Le token de réinitialisation de mot de passe.
 * @param {string} userName - Nom de l'utilisateur (optionnel, pour personnaliser l'email).
 */
exports.sendPasswordResetEmail = async (email, token, userName = 'Utilisateur') => {
  if (!email || !token) {
    logger.error('sendPasswordResetEmail: Email ou token manquant.');
    return;
  }

  // L'URL de réinitialisation doit pointer vers votre frontend
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

  const htmlContent = `
    <h1>Bonjour ${userName},</h1>
    <p>Vous avez demandé une réinitialisation de votre mot de passe pour votre compte sur ${defaultFromName}.</p>
    <p>Veuillez cliquer sur le lien ci-dessous pour choisir un nouveau mot de passe :</p>
    <p><a href="${resetUrl}" target="_blank" style="background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">Réinitialiser mon mot de passe</a></p>
    <p>Ce lien expirera dans 1 heure (ou selon la configuration de votre token).</p>
    <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
    <p>Cordialement,<br/>L'équipe ${defaultFromName}</p>
  `;
  const textContent = `
    Bonjour ${userName},
    Vous avez demandé une réinitialisation de votre mot de passe pour votre compte sur ${defaultFromName}.
    Veuillez copier et coller le lien suivant dans votre navigateur pour choisir un nouveau mot de passe :
    ${resetUrl}
    Ce lien expirera dans 1 heure (ou selon la configuration de votre token).
    Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.
    Cordialement,
    L'équipe ${defaultFromName}
  `;

  try {
    await sendEmail({
      to: email,
      subject: `Réinitialisation de votre mot de passe - ${defaultFromName}`,
      text: textContent,
      html: htmlContent,
    });
  } catch (error) {
    logger.error(`Échec de l'envoi de l'email de réinitialisation de mot de passe à ${email}`);
    // L'erreur est déjà logguée par sendEmail
  }
};
