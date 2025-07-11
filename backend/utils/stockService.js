// backend/utils/stockService.js
const Product = require('../models/Product');
const Order = require('../models/Order'); // Optionnel, si on veut plus de détails de la commande
const mongoose = require('mongoose');

/**
 * Met à jour le stock des produits après qu'une commande a été payée.
 * @param {string} orderId - L'ID de la commande pour laquelle mettre à jour les stocks.
 */
exports.updateStock = async (orderId) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    console.error(`StockService: ID de commande invalide: ${orderId}`);
    return; // Ou throw new Error(...) si on veut une gestion d'erreur plus agressive
  }

  const session = await mongoose.startSession(); // Utiliser une transaction pour la atomicité
  session.startTransaction();

  try {
    const order = await Order.findById(orderId).session(session);
    if (!order) {
      console.error(`StockService: Commande ${orderId} non trouvée pour la mise à jour du stock.`);
      await session.abortTransaction();
      session.endSession();
      return;
    }

    if (order.stockUpdated) { // S'assurer que le stock n'est mis à jour qu'une seule fois
        console.log(`StockService: Le stock pour la commande ${orderId} a déjà été mis à jour.`);
        await session.commitTransaction(); // Valider la transaction même si aucune opération n'est faite
        session.endSession();
        return;
    }

    for (const item of order.orderItems) {
      const product = await Product.findById(item.product).session(session);
      if (!product) {
        console.warn(`StockService: Produit ID ${item.product} de la commande ${orderId} non trouvé. Stock non mis à jour pour cet article.`);
        continue; // Passer à l'article suivant
      }

      const newStock = product.stock - item.quantity;
      if (newStock < 0) {
        // Ceci ne devrait idéalement pas arriver si le stock est vérifié à la création de commande.
        // C'est une sécurité supplémentaire ou pour gérer des cas limites.
        console.error(`StockService: Stock négatif pour le produit ${product.name} (ID: ${product._id}) après commande ${orderId}. Demandé: ${item.quantity}, Stock actuel: ${product.stock}.`);
        // Décider d'une stratégie: annuler la transaction, logguer et continuer, etc.
        // Pour l'instant, on loggue et on met le stock à 0 pour éviter un stock négatif en BDD.
        product.stock = 0;
      } else {
        product.stock = newStock;
      }

      await product.save({ session }); // Sauvegarder le produit dans la session de transaction
      console.log(`StockService: Stock pour ${product.name} (ID: ${product._id}) mis à jour à ${product.stock}.`);
    }

    // Marquer la commande comme ayant eu son stock mis à jour
    order.stockUpdated = true;
    await order.save({ session });

    await session.commitTransaction(); // Valider toutes les mises à jour de stock
    console.log(`StockService: Tous les stocks pour la commande ${orderId} ont été mis à jour avec succès.`);

  } catch (error) {
    await session.abortTransaction(); // Annuler la transaction en cas d'erreur
    console.error(`StockService: Erreur lors de la mise à jour des stocks pour la commande ${orderId}:`, error);
    // Il pourrait être judicieux de relancer l'erreur pour que le webhook Stripe sache qu'il y a eu un problème
    // et potentiellement réessaie, ou pour qu'une alerte soit générée.
    // throw error;
  } finally {
    session.endSession(); // Toujours terminer la session
  }
};
