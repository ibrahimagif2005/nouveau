// frontend/src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';

import Header from './components/Header';
import CartModal from './components/CartModal';
// import Footer from './components/Footer';

import HomePage from './pages/Home';
import ProductDetailPage from './pages/ProductDetail';
import CheckoutPage from './pages/Checkout';
import LoginPage from './pages/LoginPage'; // Importation de la nouvelle page
import RegisterPage from './pages/RegisterPage'; // Importation de la nouvelle page

import './index.css';

function App() {
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  const toggleCartModal = () => {
    setIsCartModalOpen(!isCartModalOpen);
  };

  return (
    <Provider store={store}>
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
              {/* Si CartModal devient une page dédiée /cart, la route irait ici */}
              {/* <Route path="/cart" element={<CartPage />} /> */}
              <Route path="*" element={<div className="text-center text-2xl mt-10">404 - Page Non Trouvée</div>} />
            </Routes>
          </main>
          {/* <Footer /> */}
          {isCartModalOpen && <CartModal isOpen={isCartModalOpen} onClose={toggleCartModal} />}
        </div>
      </Router>
    </Provider>
  );
}

export default App;
