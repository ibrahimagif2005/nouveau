// frontend/src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import authReducer from './slices/authSlice';
// Importez d'autres reducers ici si vous en avez plus tard
// import productReducer from './slices/productSlice';

const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    // product: productReducer, // Exemple si vous avez un slice pour les produits
    // ... autres reducers
  },
  // Middleware est configuré par défaut par configureStore (inclut redux-thunk)
  // devTools: process.env.NODE_ENV !== 'production', // Activé par défaut en dev, désactivé en prod
});

export default store;
