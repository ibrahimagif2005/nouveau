// frontend/src/features/recommendations/SimilarProducts.jsx
import React, { useEffect, useState } from 'react';
import ProductCard from '../products/ProductCard'; // Réutiliser ProductCard
import useApi from '../../hooks/useApi'; // Pour appeler l'API des recommandations

const SimilarProducts = ({ currentProductId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const { fetchData, isLoading, error } = useApi();

  useEffect(() => {
    if (!currentProductId) return;

    const fetchRecommendations = async () => {
      try {
        const result = await fetchData(`/products/${currentProductId}/recommendations`);
        setRecommendations(result.data || []);
      } catch (apiError) {
        console.error("Erreur lors du chargement des recommandations:", apiError.message);
        // L'erreur est déjà gérée par useApi, mais on peut logger ou définir un état d'erreur spécifique ici
      }
    };

    fetchRecommendations();
  }, [currentProductId, fetchData]);

  if (isLoading) {
    return <p className="text-center my-4">Chargement des produits similaires...</p>;
  }

  if (error && !recommendations.length) { // Afficher l'erreur seulement si pas de données précédentes
    return <p className="text-center text-red-500 my-4">Impossible de charger les recommandations: {error.message}</p>;
  }

  if (!isLoading && recommendations.length === 0) {
    return null; // Ou un message "Aucun produit similaire trouvé"
  }

  return (
    <div className="my-12">
      <h3 className="text-2xl font-semibold mb-6">Vous pourriez aussi aimer</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {recommendations.map(product => (
          <ProductCard key={product.id || product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default SimilarProducts;
