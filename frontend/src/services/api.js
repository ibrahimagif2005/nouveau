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

// Intercepteur pour ajouter le token JWT et potentiellement le token CSRF à chaque requête
api.interceptors.request.use(
  async (config) => {
    // Gérer le token d'authentification JWT (accessToken)
    // Le token est maintenant stocké dans le state Redux, mais localStorage peut servir de fallback ou pour la persistance initiale.
    // Pour une meilleure gestion, le token devrait être récupéré du store Redux ici.
    // const store = await import('../redux/store'); // Importation dynamique pour éviter les soucis de dépendance circulaire
    // const authToken = store.default.getState().auth.token;
    const authToken = localStorage.getItem('authToken'); // Simplification pour l'instant

    if (authToken) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Gérer le token CSRF pour les requêtes modifiant l'état
    const methodsRequiringCsrf = ['post', 'put', 'delete', 'patch'];
    if (methodsRequiringCsrf.includes(config.method.toLowerCase())) {
      // Le token CSRF est récupéré via un appel à /api/csrf-token et stocké (ex: dans un état global, ou une variable window pour simplifier)
      // Ce token doit être récupéré UNE SEULE FOIS par session de page ou lorsque nécessaire.
      // L'appel direct ici dans l'intercepteur pour chaque requête n'est PAS idéal.
      // Il est préférable de le récupérer au chargement de l'application.
      const csrfToken = window.csrfToken;
      if (csrfToken) {
        // csurf par défaut cherche le token dans ces en-têtes (entre autres)
        // ou dans req.body._csrf, req.query._csrf.
        // Pour les API SPA, un en-tête est préférable.
        config.headers['X-CSRF-Token'] = csrfToken; // ou 'XSRF-TOKEN'
      } else {
        // Si le token n'est pas là, cela pourrait être un problème pour les requêtes non-GET.
        // En production, on pourrait vouloir rejeter la requête ou logger une alerte plus sévère.
        console.warn('CSRF token non disponible pour une requête modifiant l\'état.');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// Variable pour gérer une seule tentative de rafraîchissement à la fois
let isRefreshing = false;
// File d'attente pour les requêtes échouées en attente du nouveau token
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Intercepteur de réponse pour gérer l'expiration du token et le rafraîchissement
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Vérifier si c'est une erreur 401 et que ce n'est pas une nouvelle tentative après un rafraîchissement
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Si un rafraîchissement est déjà en cours, mettre la requête en attente
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
        .then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest); // Relancer la requête avec le nouveau token
        })
        .catch(err => {
          return Promise.reject(err); // Le rafraîchissement a échoué
        });
      }

      originalRequest._retry = true; // Marquer la requête pour éviter les boucles de rafraîchissement infinies
      isRefreshing = true;

      try {
        // Tenter de rafraîchir le token
        // L'endpoint /api/auth/refresh-token utilise un cookie HttpOnly, donc pas besoin d'envoyer de corps de requête
        const { data } = await api.post('/auth/refresh-token'); // l'instance `api` enverra le cookie automatiquement
        const newAccessToken = data.accessToken;

        // Mettre à jour le token dans localStorage (ou mieux, dans le store Redux et laisser un effet le persister)
        localStorage.setItem('authToken', newAccessToken);
        // Mettre à jour l'en-tête de la requête originale
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken); // Exécuter les requêtes en file d'attente avec le nouveau token
        isRefreshing = false;
        return api(originalRequest); // Relancer la requête originale avec le nouveau token
      } catch (refreshError) {
        processQueue(refreshError, null); // Rejeter les requêtes en file d'attente
        isRefreshing = false;
        console.error('Impossible de rafraîchir le token:', refreshError.response?.data?.message || refreshError.message);
        // Déconnecter l'utilisateur si le rafraîchissement échoue (ex: refresh token expiré ou invalide)
        localStorage.removeItem('authToken');
        // Idéalement, dispatcher une action Redux pour déconnecter l'utilisateur proprement
        // import store from '../redux/store'; // Attention aux imports circulaires
        // store.dispatch(logoutUserAction()); // Exemple
        window.location.href = '/login'; // Redirection brutale, une redirection via React Router est préférable
        return Promise.reject(refreshError);
      }
    }

    // Si l'erreur n'est pas un 401 ou si _retry est déjà true, rejeter l'erreur
    // Logique d'erreur existante
    if (error.response) {
      console.error('API Error Response:', error.response.data);
      console.error('Status:', error.response.status);
    } else if (error.request) {
      console.error('API No Response:', error.request);
    } else {
      console.error('API Request Setup Error:', error.message);
    }
    return Promise.reject(error);
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
