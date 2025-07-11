// frontend/src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import CartIcon from '../features/cart/CartIcon';
import SearchBar from '../features/search/SearchBar'; // Importer SearchBar
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser, selectIsLoggedIn, selectCurrentUser } from '../redux/slices/authSlice'; // Assurez-vous que les chemins sont corrects

const Header = ({ openCartModal }) => {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutUser());
    // Optionnel: rediriger vers l'accueil ou la page de connexion après la déconnexion
    // navigate('/');
  };

  return (
    <header className="bg-gray-800 text-white p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex flex-wrap justify-between items-center gap-y-3">
        <Link to="/" className="text-2xl font-bold hover:text-gray-300 transition-colors">
          MonEcommerce
        </Link>

        {/* SearchBar au centre pour les écrans plus grands, prend toute la largeur sur mobile */}
        <div className="w-full md:w-auto md:flex-grow md:mx-8 order-3 md:order-2">
          <SearchBar />
        </div>

        <nav className="flex items-center space-x-4 md:space-x-6 order-2 md:order-3">
          <Link to="/" className="hover:text-gray-300 transition-colors hidden sm:inline">Accueil</Link>

          {isLoggedIn ? (
            <>
              <Link to="/profile" className="hover:text-gray-300 transition-colors">
                {currentUser?.name ? `Bonjour, ${currentUser.name.split(' ')[0]}` : 'Mon Profil'}
              </Link>
              <button
                onClick={handleLogout}
                className="hover:text-gray-300 transition-colors"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-gray-300 transition-colors">Connexion</Link>
              <Link to="/register" className="hover:text-gray-300 transition-colors">Inscription</Link>
            </>
          )}
          <CartIcon onClick={openCartModal} />
        </nav>
      </div>
    </header>
  );
};

export default Header;
