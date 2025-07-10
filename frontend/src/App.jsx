// frontend/src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux'; // Pour connecter Redux à React
import store from './redux/store'; // Votre store Redux

import Header from './components/Header';
import CartModal from './components/CartModal'; // Si vous l'utilisez comme un modal global
// import Footer from './components/Footer'; // Si vous avez un Footer

import HomePage from './pages/Home';
import ProductDetailPage from './pages/ProductDetail';
import CheckoutPage from './pages/Checkout';
// Importez d'autres pages ici (LoginPage, RegisterPage, ProfilePage, etc.)
// import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage';

// Supposons que vous ayez un fichier CSS global pour Tailwind ou des styles de base
import './index.css'; // Assurez-vous que ce chemin est correct pour vos styles globaux (souvent dans src/)

function App() {
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  const toggleCartModal = () => {
    setIsCartModalOpen(!isCartModalOpen);
  };

  return (
    <Provider store={store}>
      <Router>
        <div className="flex flex-col min-h-screen">
          {/* Passez toggleCartModal au Header si le bouton du panier s'y trouve */}
          <Header /* openCartModal={toggleCartModal} */ />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              {/* Exemple de route pour le panier si c'est une page dédiée */}
              {/* <Route path="/cart" element={<CartPage />} /> */}
              {/* Exemple de routes pour l'authentification */}
              {/* <Route path="/login" element={<LoginPage />} /> */}
              {/* <Route path="/register" element={<RegisterPage />} /> */}

              {/* Ajoutez d'autres routes ici */}
              <Route path="*" element={<div className="text-center text-2xl mt-10">404 - Page Non Trouvée</div>} />
            </Routes>
          </main>
          {/* <Footer /> */}
          {/* Affichez le modal du panier s'il est ouvert */}
          {isCartModalOpen && <CartModal isOpen={isCartModalOpen} onClose={toggleCartModal} />}
        </div>
      </Router>
    </Provider>
  );
}

export default App;
