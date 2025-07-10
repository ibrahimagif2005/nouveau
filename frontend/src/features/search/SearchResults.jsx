// frontend/src/features/search/SearchResults.jsx
import React from 'react';
import ProductCard from '../products/ProductCard'; // Réutiliser ProductCard

const SearchResults = ({ results, isLoading, error }) => {
  if (isLoading) {
    return <p className="text-center my-8">Recherche en cours...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 my-8">Erreur lors de la recherche : {error}</p>;
  }

  if (!results || results.length === 0) {
    return <p className="text-center my-8">Aucun produit trouvé pour votre recherche.</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-6">Résultats de la Recherche</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {results.map(product => (
          <ProductCard key={product.id || product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
