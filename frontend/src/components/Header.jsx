// frontend/src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Supposant que vous utiliserez React Router
// import { useSelector } from 'react-redux'; // Pour accéder au state Redux (ex: nombre d'articles dans le panier)
// import { FaShoppingCart } from 'react-icons/fa'; // Exemple d'icône

const Header = () => {
  // const cartItems = useSelector(state => state.cart.items); // Exemple
  // const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          MonEcommerce
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link to="/" className="hover:text-gray-300">Accueil</Link>
            </li>
            <li>
              <Link to="/products" className="hover:text-gray-300">Produits</Link>
            </li>
            {/* Exemple de lien vers le panier */}
            <li>
              <Link to="/cart" className="relative hover:text-gray-300">
                {/* <FaShoppingCart size={20} /> */}
                {/* {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-xs rounded-full px-1.5 py-0.5">
                    {itemCount}
                  </span>
                )} */}
                Panier (Placeholder)
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-gray-300">Connexion</Link>
            </li>
            {/* Ajouter d'autres liens de navigation ici (ex: compte, déconnexion) */}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
