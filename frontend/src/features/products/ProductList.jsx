// frontend/src/features/products/ProductList.jsx
import React from 'react';
import ProductCard from './ProductCard'; // Importation locale

const ProductList = ({ products, loading, error }) => {
  if (loading) {
    return <div className="text-center">Chargement des produits...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!products || products.length === 0) {
    return <p className="text-center">Aucun produit disponible pour le moment.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;
