// frontend/src/components/ProductCard.jsx
import React, { memo } from 'react';
import isEqual from 'react-fast-compare'; // Pour une comparaison profonde des props
import { useDispatch } from 'react-redux';
import { addToCartAction } from '../../redux/slices/cartSlice'; // Assurez-vous que le chemin est correct
import { Link } from 'react-router-dom'; // Pour lier à la page de détail du produit

// Utilisation de React.memo avec une comparaison profonde pour éviter les re-render inutiles
// si les props du produit ne changent pas réellement.
const ProductCard = memo(({ product }) => {
  const dispatch = useDispatch();

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
    <Link to={`/products/${product.id || product._id}`} className="group block border border-gray-200 bg-white rounded-lg p-4 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between">
      <div>
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-100 mb-3">
          <img
            src={product.imageUrl || 'https://via.placeholder.com/300x200?text=Image+Produit'}
            alt={product.name || 'Image du produit'}
            className="w-full h-full object-cover object-center group-hover:opacity-80 transition-opacity"
            loading="lazy" // Lazy loading natif
          />
        </div>
        <h3 className="font-semibold text-lg text-gray-800 group-hover:text-blue-600 transition-colors truncate" title={product.name}>
          {product.name || 'Produit Sans Nom'}
        </h3>
        <p className="text-gray-700 font-bold text-xl my-1">
          ${product.price !== undefined ? product.price.toFixed(2) : 'N/A'}
        </p>
        {/* <p className="text-sm text-gray-600 mt-1 truncate">{product.description || ''}</p> */}
      </div>
      <button
        onClick={handleAddToCart}
        disabled={product.stock === 0}
        className={`w-full mt-4 font-semibold py-2 px-4 rounded-md text-white transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${product.stock === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 transform hover:scale-105'
                    }`}
      >
        {product.stock === 0 ? 'Épuisé' : 'Ajouter au panier'}
      </button>
    </Link>
  );
}, isEqual); // Utiliser isEqual de react-fast-compare pour une comparaison profonde

export default ProductCard;
