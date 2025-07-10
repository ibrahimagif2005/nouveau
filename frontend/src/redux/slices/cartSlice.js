// frontend/src/redux/slices/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [], // Chaque item: { id, name, price, quantity, imageUrl, ...autresInfosProduit }
  // Vous pourriez aussi stocker les totaux ici, ou les calculer à la volée dans les selectors/composants
  // itemsPrice: 0,
  // shippingPrice: 0, // Pourrait être calculé ou fixe
  // taxPrice: 0,      // Pourrait être calculé
  // totalPrice: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Action pour ajouter un produit au panier ou augmenter sa quantité
    addToCartAction: (state, action) => {
      const newItem = action.payload; // Le produit complet avec la quantité à ajouter (souvent 1)
      const existingItem = state.items.find(item => item.id === newItem.id);

      if (existingItem) {
        existingItem.quantity += newItem.quantity || 1;
      } else {
        state.items.push({ ...newItem, quantity: newItem.quantity || 1 });
      }
      // Recalculer les totaux si vous les stockez dans le state
    },
    // Action pour retirer un produit du panier
    removeFromCartAction: (state, action) => {
      const productIdToRemove = action.payload; // ID du produit à retirer
      state.items = state.items.filter(item => item.id !== productIdToRemove);
      // Recalculer les totaux
    },
    // Action pour mettre à jour la quantité d'un produit
    updateQuantityAction: (state, action) => {
      const { productId, quantity } = action.payload;
      const itemToUpdate = state.items.find(item => item.id === productId);

      if (itemToUpdate) {
        if (quantity < 1) { // Si la quantité devient 0 ou moins, retirer l'article
          state.items = state.items.filter(item => item.id !== productId);
        } else {
          itemToUpdate.quantity = quantity;
        }
      }
      // Recalculer les totaux
    },
    // Action pour vider complètement le panier (ex: après une commande réussie)
    clearCartAction: (state) => {
      state.items = [];
      // Réinitialiser les totaux
    },
    // Vous pourriez avoir d'autres actions, par exemple pour charger un panier sauvegardé
    // loadCart: (state, action) => {
    //   state.items = action.payload.items;
    //   // ... charger d'autres infos du panier
    // }
  },
});

export const {
  addToCartAction,
  removeFromCartAction,
  updateQuantityAction,
  clearCartAction,
} = cartSlice.actions;

// Sélecteurs (optionnel, mais bonne pratique pour accéder au state)
export const selectCartItems = state => state.cart.items;
export const selectCartTotalItems = state => state.cart.items.reduce((total, item) => total + item.quantity, 0);
export const selectCartTotalPrice = state => state.cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

export default cartSlice.reducer;
