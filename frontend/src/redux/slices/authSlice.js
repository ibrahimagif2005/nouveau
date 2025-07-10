// frontend/src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import api from '../../services/api'; // Votre service API pour les appels backend

// État initial pour l'authentification
const initialState = {
  user: null, // Informations de l'utilisateur connecté (ex: { id, name, email, token })
  token: localStorage.getItem('authToken') || null, // Récupérer le token depuis le localStorage s'il existe
  isLoading: false,
  isSuccess: false, // Pour suivre le succès des opérations async
  isError: false,
  message: '', // Pour les messages d'erreur ou de succès
};

// Thunk asynchrone pour l'enregistrement (register)
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      // const response = await api.post('/auth/register', userData);
      // localStorage.setItem('authToken', response.data.token); // Sauvegarder le token
      // return response.data; // Contient généralement { user, token, message }
      console.log('Register thunk (placeholder):', userData);
      // Simulation
      return new Promise(resolve => setTimeout(() => resolve({ user: {id: 'newUserId', name: userData.name, email: userData.email}, token: 'fake_jwt_token_register', message: 'Utilisateur enregistré avec succès!' }), 1000));
    } catch (error) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Thunk asynchrone pour la connexion (login)
export const loginUser = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      // const response = await api.post('/auth/login', userData);
      // localStorage.setItem('authToken', response.data.token);
      // return response.data;
      console.log('Login thunk (placeholder):', userData);
      // Simulation
       return new Promise(resolve => setTimeout(() => {
        if (userData.email === 'test@example.com' && userData.password === 'password') {
          resolve({ user: {id: 'userId123', name: 'Test User', email: userData.email}, token: 'fake_jwt_token_login', message: 'Connexion réussie!' });
        } else {
          thunkAPI.rejectWithValue('Email ou mot de passe incorrect.');
        }
      }, 1000));
    } catch (error) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Thunk asynchrone pour la déconnexion
export const logoutUser = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('authToken'); // Supprimer le token
  // Vous pourriez aussi appeler une API de déconnexion si votre backend le gère
  // await api.post('/auth/logout');
  console.log('Logout thunk (placeholder)');
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuthStatus: (state) => { // Pour réinitialiser les statuts isSuccess, isError, message
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    // Si vous avez besoin de mettre à jour l'utilisateur directement (ex: après modification du profil)
    // updateUserState: (state, action) => {
    //   state.user = { ...state.user, ...action.payload };
    // }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.message = action.payload.message || 'Enregistrement réussi!';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload; // Message d'erreur du thunkAPI.rejectWithValue
        state.user = null;
        state.token = null;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.message = action.payload.message || 'Connexion réussie!';
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
        state.token = null;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isSuccess = true; // Optionnel, pour indiquer que la déconnexion a réussi
        state.message = 'Déconnexion réussie.';
      });
  },
});

export const { resetAuthStatus } = authSlice.actions;

// Sélecteurs
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsLoggedIn = (state) => !!state.auth.token; // Ou basé sur state.auth.user
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.isError ? state.auth.message : null;
export const selectAuthSuccessMessage = (state) => state.auth.isSuccess ? state.auth.message : null;


export default authSlice.reducer;
