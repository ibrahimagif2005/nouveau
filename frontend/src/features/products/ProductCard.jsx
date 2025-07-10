// frontend/src/components/ProductCard.jsx
import React from 'react';
// import { useDispatch } from 'react-redux';
// import { addToCartAction } from '../redux/slices/cartSlice'; // Exemple d'action Redux

const ProductCard = ({ product }) => {
  // const dispatch = useDispatch();

  const handleAddToCart = (productToAdd) => {
    // dispatch(addToCartAction(productToAdd));
    console.log('Ajout au panier (placeholder):', productToAdd);
    // Vous implémenterez la logique réelle avec Redux ici
  };

  if (!product) {
    return <div className="border rounded-lg p-4 shadow-md">Chargement du produit...</div>;
  }

  return (
    <div className="border rounded-lg p-4 shadow-md flex flex-col justify-between">
      <img
        src={product.imageUrl || 'https://via.placeholder.com/150'} // Image placeholder
        alt={product.name || 'Nom du produit'}
        className="w-full h-48 object-cover mb-2"
      />
      <div>
        <h3 className="font-bold text-lg mt-2">{product.name || 'Produit Sans Nom'}</h3>
        <p className="text-gray-700">${product.price !== undefined ? product.price.toFixed(2) : 'N/A'}</p>
        {product.description && <p className="text-sm text-gray-600 mt-1">{product.description}</p>}
      </div>
      <button
        onClick={() => handleAddToCart(product)}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 w-full"
      >
        Ajouter au panier
      </button>
    </div>
  );
};

export default ProductCard;
