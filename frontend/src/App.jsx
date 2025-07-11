// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './redux/store';
import { fetchUser, selectAuthToken, forceLogout } from './redux/slices/authSlice'; // Importer fetchUser et le sélecteur de token

import Header from './components/Header';
import CartModal from './components/CartModal';
// import Footer from './components/Footer';

import HomePage from './pages/Home';
import ProductDetailPage from './pages/ProductDetail';
import CheckoutPage from './pages/Checkout';
import LoginPage from './pages/LoginPage'; // Importation de la nouvelle page
import RegisterPage from './pages/RegisterPage';
import SearchResultsPage from './pages/SearchResultsPage';
import ProfilePage from './pages/ProfilePage'; // Importer ProfilePage

import './index.css';

// Un composant interne pour accéder au dispatch Redux car App est en dehors du Provider au début
const AppContent = () => {
  const dispatch = useDispatch();
  const token = useSelector(selectAuthToken); // Lire le token depuis le state Redux
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  useEffect(() => {
    // Si un token existe (depuis localStorage via l'état initial de Redux), essayer de récupérer l'utilisateur
    if (token) {
      dispatch(fetchUser()).catch(() => {
        // Si fetchUser échoue (ex: token invalide et refresh échoue aussi via intercepteur),
        // l'intercepteur devrait gérer la déconnexion, mais on peut aussi forcer ici.
        // L'état Redux sera mis à jour par fetchUser.rejected.
        // On pourrait aussi explicitement appeler dispatch(forceLogout()) si nécessaire.
        console.log("App.jsx: fetchUser a échoué, l'utilisateur devrait être déconnecté par les intercepteurs/reducers.");
      });
    }
  }, [dispatch, token]); // Déclencher si le token change (ex: après connexion/déconnexion)

  const toggleCartModal = () => {
    setIsCartModalOpen(!isCartModalOpen);
  };

  // Récupérer le token CSRF au chargement de l'application
  useEffect(() => {
    const getCsrfToken = async () => {
      try {
        // Utiliser l'instance api directement si elle est configurée pour ne pas ajouter le token CSRF à cette requête spécifique
        // ou une instance axios séparée. Pour l'instant, on suppose que services/api.js ne bloque pas GET sans CSRF.
        const response = await store.getState().auth.token ? api.get('/csrf-token') : axios.get('/api/csrf-token', { baseURL: process.env.REACT_APP_API_URL || '/api' });
        window.csrfToken = response.data.csrfToken;
        console.log("CSRF Token obtenu et stocké:", window.csrfToken);
      } catch (error) {
        console.error("Erreur lors de la récupération du token CSRF:", error);
      }
    };
    getCsrfToken();
  }, []);


  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Header openCartModal={toggleCartModal} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/search-results" element={<SearchResultsPage />} />
            <Route path="/profile" element={<ProfilePage />} /> {/* Nouvelle route pour le profil */}
            <Route path="*" element={<div className="text-center text-2xl mt-10">404 - Page Non Trouvée</div>} />
          </Routes>
        </main>
        {isCartModalOpen && <CartModal isOpen={isCartModalOpen} onClose={toggleCartModal} />}
      </div>
    </Router>
  );
};

// Importer axios pour l'appel CSRF initial si pas de token d'auth
import axios from 'axios';
// Assurez-vous que api est aussi importé si vous l'utilisez pour l'appel CSRF conditionnel
import api from './services/api';


function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
