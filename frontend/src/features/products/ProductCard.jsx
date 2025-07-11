// frontend/src/components/ProductCard.jsx
import React, { memo } from 'react';
import isEqual from 'react-fast-compare';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartAction } from '../../redux/slices/cartSlice';
import { Link } from 'react-router-dom';
import WishlistButton from '../wishlist/WishlistButton'; // Importer WishlistButton
import { selectCurrentUser } from '../../redux/slices/authSlice';

const ProductCard = memo(({ product }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);

  // Déterminer si le produit est dans la wishlist de l'utilisateur actuel
  // Cette logique pourrait être plus complexe si la wishlist est gérée dans Redux aussi.
  // Pour l'instant, on suppose que `currentUser.wishlist` contient les IDs des produits.
  const initialIsInWishlist = currentUser?.wishlist?.some(
    (item) => (item._id || item) === (product?._id || product?.id)
  ) || false;


  const handleAddToCart = (e) => {
    e.preventDefault(); // Empêcher la navigation si le bouton est dans un Link/ancre
    e.stopPropagation(); // Empêcher la propagation à un Link parent
    if (product) {
      dispatch(addToCartAction({ ...product, quantity: 1 })); // Ajouter une quantité par défaut
      // Optionnel: afficher une notification
      console.log(`Ajouté au panier: ${product.name}`);
    }
  };

  if (!product) {
    // Squelette ou placeholder si le produit est en cours de chargement (géré par le parent ProductList)
    return (
      <div className="border border-gray-200 bg-white rounded-lg p-4 shadow-sm animate-pulse">
        <div className="w-full h-48 bg-gray-300 rounded mb-3"></div>
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-3"></div>
        <div className="h-10 bg-gray-300 rounded w-full"></div>
      </div>
    );
  }

  return (
    <Link to={`/products/${product?._id || product?.id}`} className="group block border border-gray-200 bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <div className="relative">
        {/* Conteneur d'image avec hauteur responsive */}
        <div className="w-full h-48 sm:h-56 md:h-64 overflow-hidden rounded-t-md bg-gray-100">
          <img
            src={product.imageUrl || 'https://via.placeholder.com/400x300?text=Image+Produit'} // Image plus grande pour desktop
            alt={product.name || 'Image du produit'}
            className="w-full h-full object-cover object-center group-hover:opacity-80 transition-opacity duration-300"
            loading="lazy"
          />
        </div>
        <div className="absolute top-2 right-2 z-10"> {/* S'assurer que le bouton est au-dessus */}
          <WishlistButton productId={product?._id || product?.id} initialIsInWishlist={initialIsInWishlist} />
        </div>
      </div>
      <div className="p-3 sm:p-4 flex flex-col flex-grow justify-between">
        <div>
          {/* Titre du produit avec line-clamp pour 2 lignes max */}
          <h3 className="font-semibold text-base sm:text-lg text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 h-12 sm:h-14" title={product.name}>
            {product.name || 'Produit Sans Nom'}
          </h3>
          <p className="text-gray-700 font-bold text-lg sm:text-xl my-1 sm:my-2">
            ${product.price !== undefined ? product.price.toFixed(2) : 'N/A'}
          </p>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`w-full mt-3 font-semibold py-2 px-4 rounded-md text-white transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
                      ${product.stock === 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 transform hover:scale-105'
                      }`}
        >
          {product.stock === 0 ? 'Épuisé' : 'Ajouter au panier'}
        </button>
      </div>
    </Link>
  );
}, isEqual);

export default ProductCard;
