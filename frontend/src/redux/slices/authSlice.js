// frontend/src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api'; // Utiliser notre instance Axios configurée

const initialState = {
  user: null, // Informations de l'utilisateur connecté
  token: localStorage.getItem('authToken') || null, // AccessToken
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Thunk pour l'enregistrement
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      const response = await api.post('/auth/register', userData); // Utilisation de l'instance api
      return response.data;
    } catch (error) {
      const message = (error.response?.data?.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Thunk pour la connexion
export const loginUser = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      const response = await api.post('/auth/login', userData); // Utilisation de l'instance api
      if (response.data.accessToken) {
        localStorage.setItem('authToken', response.data.accessToken);
      }
      return response.data; // Devrait contenir { success: true, accessToken, user }
    } catch (error) {
      const message = (error.response?.data?.message) || error.message || error.toString();
      localStorage.removeItem('authToken');
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Thunk pour la déconnexion
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, thunkAPI) => {
    try {
      await api.post('/auth/logout'); // Appeler l'API pour invalider le refresh token serveur
    } catch (error) {
      console.error("Erreur API lors de la déconnexion:", error.response?.data?.message || error.message);
      // On continue la déconnexion côté client même si l'appel API échoue
    } finally {
      localStorage.removeItem('authToken');
      // Le cookie refreshToken HttpOnly est géré par le serveur (supprimé/expiré)
    }
    return { message: 'Déconnexion réussie.' };
  }
);

// Thunk pour récupérer les informations de l'utilisateur connecté (si token valide)
export const fetchUser = createAsyncThunk(
    'auth/fetchUser',
    async (_, thunkAPI) => {
        // Le token est déjà dans l'intercepteur Axios, donc pas besoin de le récupérer ici explicitement
        // Sauf si on veut vérifier sa présence avant l'appel.
        const token = localStorage.getItem('authToken') || thunkAPI.getState().auth.token;
        if (!token) {
            return thunkAPI.rejectWithValue('Aucun token, impossible de récupérer l\'utilisateur.');
        }
        try {
            const response = await api.get('/auth/me');
            return response.data.data; // Supposant que les données utilisateur sont dans response.data.data
        } catch (error) {
            const message = (error.response?.data?.message) || error.message || error.toString();
            // Si /me échoue (ex: token invalide), l'intercepteur Axios devrait déjà gérer le logout.
            // Mais on peut aussi forcer ici.
            localStorage.removeItem('authToken');
            return thunkAPI.rejectWithValue(message);
        }
    }
);


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuthStatus: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    // Action pour mettre à jour le token (ex: après un rafraîchissement réussi par l'intercepteur Axios)
    setAccessToken: (state, action) => {
        state.token = action.payload;
        localStorage.setItem('authToken', action.payload); // Garder localStorage synchronisé
    },
    // Action pour une déconnexion initiée par l'intercepteur (ex: refresh token échoue)
    forceLogout: (state) => {
        state.user = null;
        state.token = null;
        localStorage.removeItem('authToken');
        state.message = "Session expirée ou invalide. Veuillez vous reconnecter.";
        state.isError = true; // Peut-être utile pour afficher un message
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false; state.isSuccess = false; state.message = '';
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message || 'Enregistrement réussi! Veuillez vous connecter.';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false; state.isSuccess = false; state.message = '';
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
        state.token = action.payload.accessToken; // C'est l'accessToken
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
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null; // Assurer la déconnexion client même si l'API échoue
        state.token = null;
        state.isError = true;
        state.message = "Déconnexion client effectuée. Erreur serveur optionnelle: " + (action.payload || "Inconnue");
      })
      // Fetch User
      .addCase(fetchUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.token = null; // Si fetchUser échoue, le token est probablement invalide
        state.isError = true; // Peut-être pas nécessaire si l'intercepteur gère la redirection
        state.message = action.payload;
      });
  },
});

export const { resetAuthStatus, setAccessToken, forceLogout } = authSlice.actions;

// Sélecteurs
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsLoggedIn = (state) => !!state.auth.token;
export const selectAuthToken = (state) => state.auth.token;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.isError ? state.auth.message : null;
export const selectAuthSuccessMessage = (state) => state.auth.isSuccess ? state.auth.message : null;


export default authSlice.reducer;
