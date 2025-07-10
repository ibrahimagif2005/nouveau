// frontend/src/pages/Home.jsx
import React, { useEffect, useState } /*, { useEffect, useState } */ from 'react';
import ProductCard from '../components/ProductCard';
// import api from '../services/api'; // Pour appeler votre API backend

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simuler un appel API pour récupérer les produits
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // const response = await api.get('/products'); // Exemple d'appel API
        // setProducts(response.data.data);
        // Simulation de données
        setTimeout(() => {
          setProducts([
            { id: '1', name: 'Produit Alpha', price: 29.99, imageUrl: 'https://via.placeholder.com/300x200?text=Produit+Alpha', description: 'Description brève du produit Alpha.' },
            { id: '2', name: 'Produit Beta', price: 49.99, imageUrl: 'https://via.placeholder.com/300x200?text=Produit+Beta', description: 'Description brève du produit Beta.' },
            { id: '3', name: 'Produit Gamma', price: 19.99, imageUrl: 'https://via.placeholder.com/300x200?text=Produit+Gamma', description: 'Description brève du produit Gamma.' },
            { id: '4', name: 'Produit Delta', price: 99.99, imageUrl: 'https://via.placeholder.com/300x200?text=Produit+Delta', description: 'Description brève du produit Delta.' },
          ]);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error("Erreur de chargement des produits:", err);
        setError('Impossible de charger les produits. Veuillez réessayer plus tard.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Chargement des produits...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Nos Produits</h1>
      {products.length === 0 ? (
        <p className="text-center">Aucun produit disponible pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
