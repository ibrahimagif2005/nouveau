// frontend/src/services/api.js
import axios from 'axios';

// Créez une instance Axios avec une configuration de base
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api', // URL de base de votre API backend
  // Vous pouvez ajouter d'autres configurations par défaut ici, comme les headers
  // headers: {
  //   'Content-Type': 'application/json',
  // },
});

// Intercepteur pour ajouter le token JWT à chaque requête si disponible
api.interceptors.request.use(
  (config) => {
    // Essayez de récupérer le token depuis le state Redux ou localStorage
    // Ceci est un exemple simplifié. Dans une vraie app, vous pourriez l'obtenir du store Redux.
    const token = localStorage.getItem('authToken'); // Ou depuis state.auth.token

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses (ex: erreurs globales, déconnexion si 401)
api.interceptors.response.use(
  (response) => {
    // Toute réponse avec un statut dans la plage 2xx déclenche cette fonction
    return response;
  },
  (error) => {
    // Toute réponse avec un statut en dehors de la plage 2xx déclenche cette fonction
    if (error.response) {
      // La requête a été faite et le serveur a répondu avec un code d'erreur
      console.error('API Error Response:', error.response.data);
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);

      if (error.response.status === 401) {
        // Gérer l'erreur 401 Unauthorized (ex: token expiré)
        // Vous pourriez vouloir déconnecter l'utilisateur ou rafraîchir le token
        console.warn('Unauthorized access - 401. Potentially redirect to login or refresh token.');
        // localStorage.removeItem('authToken'); // Exemple: supprimer le token invalide
        // window.location.href = '/login'; // Redirection simple, ou mieux, via React Router
      }
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error('API No Response:', error.request);
    } else {
      // Quelque chose s'est produit lors de la configuration de la requête qui a déclenché une erreur
      console.error('API Request Setup Error:', error.message);
    }
    return Promise.reject(error); // Important pour que les appels .catch() fonctionnent
  }
);

// Exporter l'instance Axios configurée
export default api;

/*
  Exemple d'utilisation dans un composant ou un service :

  import api from './api';

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des produits:", error);
      // Gérer l'erreur dans le composant
      throw error;
    }
  };

  const loginUser = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      // Sauvegarder le token, mettre à jour le state utilisateur, etc.
      return response.data;
    } catch (error) {
      throw error;
    }
  }
*/
