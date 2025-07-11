// frontend/src/features/search/SearchResultItem.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const SearchResultItem = ({ product, onSelect }) => {
  if (!product) return null;

  const handleClick = () => {
    if (onSelect) {
      onSelect(product); // Appeler la fonction onSelect si fournie (ex: pour fermer la liste de résultats)
    }
  };

  return (
    <Link
      to={`/products/${product._id || product.id}`}
      onClick={handleClick}
      className="flex items-center p-3 hover:bg-gray-100 transition-colors duration-150 border-b last:border-b-0"
    >
      <img
        src={product.imageUrl || 'https://via.placeholder.com/40x40?text=Img'}
        alt={product.name}
        className="w-10 h-10 object-cover rounded-md mr-3 flex-shrink-0"
      />
      <div className="flex-grow overflow-hidden">
        <p className="font-medium text-sm text-gray-800 truncate" title={product.name}>
          {product.name}
        </p>
        {product.price !== undefined && (
          <p className="text-xs text-gray-600">${product.price.toFixed(2)}</p>
        )}
         {product.category && (
          <p className="text-xs text-gray-500 italic">{product.category}</p>
        )}
      </div>
    </Link>
  );
};

export default SearchResultItem;
