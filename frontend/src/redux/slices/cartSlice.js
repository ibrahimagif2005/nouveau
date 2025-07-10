// frontend/src/redux/slices/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Fonction pour charger le panier depuis localStorage
const loadCartFromLocalStorage = () => {
  try {
    const serializedCart = localStorage.getItem('cartItems');
    if (serializedCart === null) {
      return []; // Retourner un tableau vide si rien n'est trouvé
    }
    return JSON.parse(serializedCart);
  } catch (e) {
    console.warn("Erreur lors du chargement du panier depuis localStorage:", e);
    return []; // Retourner un tableau vide en cas d'erreur
  }
};

// Fonction pour sauvegarder le panier dans localStorage
const saveCartToLocalStorage = (items) => {
  try {
    const serializedCart = JSON.stringify(items);
    localStorage.setItem('cartItems', serializedCart);
  } catch (e) {
    console.warn("Erreur lors de la sauvegarde du panier dans localStorage:", e);
  }
};

const initialState = {
  items: loadCartFromLocalStorage(), // Charger l'état initial depuis localStorage
  // itemsPrice, shippingPrice, taxPrice, totalPrice peuvent être ajoutés ici si nécessaire
  // et mis à jour dans les reducers ou calculés via des selectors.
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCartAction: (state, action) => {
      const newItem = action.payload;
      const existingItem = state.items.find(item => item.id === newItem.id);

      if (existingItem) {
        existingItem.quantity += newItem.quantity || 1;
      } else {
        state.items.push({ ...newItem, quantity: newItem.quantity || 1 });
      }
      saveCartToLocalStorage(state.items);
    },
    removeFromCartAction: (state, action) => {
      const productIdToRemove = action.payload;
      state.items = state.items.filter(item => item.id !== productIdToRemove);
      saveCartToLocalStorage(state.items);
    },
    updateQuantityAction: (state, action) => {
      const { productId, quantity } = action.payload;
      const itemToUpdate = state.items.find(item => item.id === productId);

      if (itemToUpdate) {
        if (quantity < 1) {
          state.items = state.items.filter(item => item.id !== productId);
        } else {
          itemToUpdate.quantity = quantity;
        }
      }
      saveCartToLocalStorage(state.items);
    },
    clearCartAction: (state) => {
      state.items = [];
      saveCartToLocalStorage(state.items); // Aussi sauvegarder le panier vide
    },
    // Action pour explicitement remplacer le panier (utile après connexion si un panier serveur existe)
    // setCartAction: (state, action) => {
    //   state.items = action.payload;
    //   saveCartToLocalStorage(state.items);
    // }
  },
});

export const {
  addToCartAction,
  removeFromCartAction,
  updateQuantityAction,
  clearCartAction,
  // setCartAction, // Décommentez si utilisé
} = cartSlice.actions;

// Sélecteurs
export const selectCartItems = state => state.cart.items;
export const selectCartTotalItems = state =>
  state.cart.items.reduce((total, item) => total + (item.quantity || 0), 0);
export const selectCartTotalPrice = state =>
  state.cart.items.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 0)), 0);

export default cartSlice.reducer;
