// frontend/src/components/CartModal.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // Pour la navigation
import CartItems from '../features/cart/CartItems'; // Utiliser le composant de feature
// import { FaTimes } from 'react-icons/fa';

const CartModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const cartItemsState = useSelector(state => state.cart.items); // Accéder aux vrais items du store
  const totalPrice = cartItemsState.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  if (!isOpen) return null;

  const handleCheckout = () => {
    onClose(); // Fermer le modal
    navigate('/checkout'); // Naviguer vers la page de paiement
  };

  return (
    // Overlay
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-end"
      onClick={onClose} // Fermer si on clique sur l'overlay
    >
      {/* Contenu du Modal */}
      <div
        className="bg-white p-6 shadow-xl w-full max-w-md h-full flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0"
        onClick={e => e.stopPropagation()} // Empêcher la fermeture si on clique dans le modal
        style={{ WebkitOverflowScrolling: 'touch' }} // Pour un défilement fluide sur iOS
      >
        <div className="flex justify-between items-center mb-4 pb-4 border-b">
          <h2 className="text-2xl font-semibold">Votre Panier</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition-colors"
            aria-label="Fermer le panier"
          >
            {/* <FaTimes size={24} /> */}
            Fermer (X)
          </button>
        </div>

        {/* CartItems gère l'affichage des articles et le message "panier vide" */}
        <CartItems />

        {cartItemsState.length > 0 && (
          <div className="mt-auto pt-6 border-t"> {/* mt-auto pour pousser vers le bas */}
            <div className="flex justify-between items-center font-semibold text-lg mb-4">
              <span>Total:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors"
            >
              Passer à la caisse
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
