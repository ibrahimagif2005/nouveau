// frontend/src/features/wishlist/WishlistButton.jsx
import React, { useState, useEffect } from 'react';
import useApi from '../../hooks/useApi'; // Ajustez le chemin si nécessaire
import { useSelector, useDispatch } from 'react-redux';
import { selectIsLoggedIn, selectCurrentUser } from '../../redux/slices/authSlice';
// Remplacer par vos icônes réelles ou des SVGs si Radix n'est pas utilisé.
// import { HeartIcon, HeartFilledIcon } from '@radix-ui/react-icons'; // Exemple

// Placeholder icons
const HeartIcon = ({ className }) => <span className={className}>♡</span>; // Coeur vide
const HeartFilledIcon = ({ className }) => <span className={className}>❤️</span>; // Coeur plein

const WishlistButton = ({ productId, initialIsInWishlist = false, onWishlistChange }) => {
  const [isInWishlist, setIsInWishlist] = useState(initialIsInWishlist);
  const { fetchData, isLoading } = useApi();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const currentUser = useSelector(selectCurrentUser); // Pour re-vérifier la wishlist après connexion/déconnexion
  const dispatch = useDispatch(); // Pour des actions Redux si on gère la wishlist dans Redux

  // Effet pour mettre à jour l'état initial si l'utilisateur se connecte/déconnecte
  // ou si la prop initialIsInWishlist change (moins probable ici)
  useEffect(() => {
    setIsInWishlist(initialIsInWishlist);
  }, [initialIsInWishlist, currentUser]);


  // Optionnel: Vérifier le statut de la wishlist au montage si l'utilisateur est connecté
  // Ceci est utile si l'état initial n'est pas fourni via les props du produit
  // useEffect(() => {
  //   const checkInitialStatus = async () => {
  //     if (isLoggedIn && productId) {
  //       try {
  //         // Supposons que /api/users/wishlist renvoie la liste des ID de produits dans la wishlist
  //         const wishlistData = await fetchData('/users/wishlist', 'GET');
  //         if (wishlistData.success && Array.isArray(wishlistData.data)) {
  //           setIsInWishlist(wishlistData.data.some(item => (item._id || item) === productId));
  //         }
  //       } catch (err) {
  //         console.error("Erreur de vérification de la wishlist:", err);
  //       }
  //     }
  //   };
  //   checkInitialStatus();
  // }, [isLoggedIn, productId, fetchData]);


  const handleToggleWishlist = async (e) => {
    e.preventDefault(); // Empêcher la navigation si dans un Link
    e.stopPropagation();

    if (!isLoggedIn) {
      // Rediriger vers la page de connexion ou afficher un message
      // navigate('/login', { state: { from: location } }); // Exemple avec React Router
      alert("Veuillez vous connecter pour ajouter des articles à votre liste de souhaits.");
      return;
    }

    if (isLoading || !productId) return;

    try {
      const response = await fetchData(`/users/wishlist/${productId}`, 'POST'); // L'API toggle et renvoie la nouvelle wishlist
      if (response.success) {
        const newIsInWishlist = response.wishlist.some(item => (item._id || item) === productId);
        setIsInWishlist(newIsInWishlist);
        if (onWishlistChange) {
          onWishlistChange(productId, newIsInWishlist, response.wishlist);
        }
      } else {
        // Gérer l'erreur de l'API (ex: afficher une notification)
        console.error("Erreur lors de la mise à jour de la wishlist:", response.message);
      }
    } catch (err) {
      console.error("Erreur API lors de la mise à jour de la wishlist:", err);
    }
  };

  // Ne pas afficher le bouton si pas de productId (ex: produit en chargement)
  if(!productId) return null;

  return (
    <button
      onClick={handleToggleWishlist}
      disabled={isLoading}
      className={`p-2 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
      aria-label={isInWishlist ? "Retirer de la liste de souhaits" : "Ajouter à la liste de souhaits"}
      title={isInWishlist ? "Retirer de la liste de souhaits" : "Ajouter à la liste de souhaits"}
    >
      {isInWishlist ? (
        <HeartFilledIcon className="text-red-500 w-5 h-5 sm:w-6 sm:h-6" />
      ) : (
        <HeartIcon className="text-gray-500 hover:text-red-400 w-5 h-5 sm:w-6 sm:h-6" />
      )}
    </button>
  );
};

export default WishlistButton;
