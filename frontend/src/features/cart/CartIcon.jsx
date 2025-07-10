// frontend/src/features/cart/CartIcon.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
// import { FaShoppingCart } from 'react-icons/fa'; // Assurez-vous d'installer react-icons

const CartIcon = ({ onClick }) => { // onClick peut être utilisé pour ouvrir un modal de panier
  const cartItems = useSelector(state => state.cart.items);
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const commonClasses = "relative text-white hover:text-gray-300 transition-colors";

  // Si un onClick est fourni (pour un modal), c'est un bouton. Sinon, un lien vers une page panier.
  const WrapperComponent = onClick ? 'button' : Link;
  const props = onClick ? { onClick } : { to: '/cart' }; // '/cart' est un exemple de route pour la page panier

  return (
    <WrapperComponent {...props} className={commonClasses} aria-label="Voir le panier">
      {/* <FaShoppingCart size={24} /> */}
      <span className="text-2xl">🛒</span> {/* Placeholder si react-icons n'est pas utilisé */}
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </WrapperComponent>
  );
};

export default CartIcon;
