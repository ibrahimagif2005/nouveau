// frontend/src/features/products/ProductList.jsx
import React from 'react';
import ProductCard from './ProductCard';

const ProductList = ({ products, loading, error }) => {
  if (loading) {
    // Squelette pour la liste de produits
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="border border-gray-200 bg-white rounded-lg p-4 shadow-sm animate-pulse">
            <div className="w-full h-48 bg-gray-300 rounded mb-3"></div>
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-3"></div>
            <div className="h-10 bg-gray-300 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    // Afficher un message d'erreur plus convivial
    return (
      <div className="text-center py-10 px-4">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Oops! Une erreur est survenue.</h2>
        <p className="text-gray-700">Impossible de charger les produits pour le moment. Veuillez réessayer plus tard.</p>
        {error && <p className="text-sm text-gray-500 mt-2">Détail: {typeof error === 'string' ? error : error.message}</p>}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-gray-700">Aucun produit trouvé.</h2>
        <p className="text-gray-500">Essayez d'ajuster vos filtres ou revenez plus tard.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map(product => (
        // Utiliser product._id car MongoDB utilise _id par défaut
        <ProductCard key={product._id || product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;
