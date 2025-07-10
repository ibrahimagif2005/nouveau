// frontend/src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import CartIcon from '../features/cart/CartIcon';
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
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold hover:text-gray-300 transition-colors">
          MonEcommerce
        </Link>
        <nav className="flex items-center space-x-4 md:space-x-6">
          <Link to="/" className="hover:text-gray-300 transition-colors">Accueil</Link>

          {isLoggedIn ? (
            <>
              {/* Vous pouvez ajouter un lien vers un profil utilisateur ici si nécessaire */}
              {/* <Link to="/profile" className="hover:text-gray-300">{currentUser?.name || 'Profil'}</Link> */}
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
