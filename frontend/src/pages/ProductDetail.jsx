// frontend/src/pages/ProductDetail.jsx
import React, { useEffect, useState } /*, { useEffect, useState } */ from 'react';
import { useParams } from 'react-router-dom';
// import api from '../services/api';
// import { useDispatch } from 'react-redux';
// import { addToCartAction } from '../redux/slices/cartSlice';
import ReviewForm from '../features/reviews/ReviewForm'; // Importer ReviewForm
import SimilarProducts from '../features/recommendations/SimilarProducts'; // Importer SimilarProducts
// import RatingStars from '../features/reviews/RatingStars'; // Si affichage note moyenne

const ProductDetailPage = () => {
  const { id: productId } = useParams(); // Récupère l'ID du produit depuis l'URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  // const dispatch = useDispatch();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        // const response = await api.get(`/products/${productId}`); // Exemple d'appel API
        // setProduct(response.data.data);
        // Simulation de données
        setTimeout(() => {
          if (productId === "1") {
            setProduct({
              id: '1',
              name: 'Produit Alpha Détaillé',
              price: 29.99,
              imageUrl: 'https://via.placeholder.com/600x400?text=Produit+Alpha',
              description: 'Ceci est une description détaillée et plus longue pour le Produit Alpha. Il possède de nombreuses fonctionnalités intéressantes et est fabriqué avec des matériaux de haute qualité. Parfait pour tous vos besoins.',
              stock: 10,
              category: 'Électronique'
            });
          } else {
             setProduct({
              id: productId,
              name: `Produit ${productId} Détaillé`,
              price: Math.floor(Math.random() * 100) + 20,
              imageUrl: `https://via.placeholder.com/600x400?text=Produit+${productId}`,
              description: `Description détaillée pour le produit ${productId}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
              stock: Math.floor(Math.random() * 20) + 5,
              category: 'Divers'
            });
          }
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error(`Erreur de chargement du produit ${productId}:`, err);
        setError('Impossible de charger les détails du produit.');
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (product && quantity > 0) {
      // dispatch(addToCartAction({ ...product, quantity }));
      console.log(`Ajout de ${quantity} x ${product.name} au panier (placeholder)`);
      // Afficher une notification ou rediriger
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Chargement des détails du produit...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-500">{error}</div>;
  }

  if (!product) {
    return <div className="container mx-auto p-4 text-center">Produit non trouvé.</div>;
  }

  return (
    <div className="container mx-auto p-4 mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
        {/* Colonne Image */}
        <div className="md:col-span-1">
          <img
            src={product.imageUrl || `https://via.placeholder.com/600x400?text=${product.name.replace(/\s+/g, '+')}`}
            alt={product.name}
            className="w-full h-auto max-h-[500px] object-contain rounded-lg shadow-lg"
          />
        </div>

        {/* Colonne Détails */}
        <div className="md:col-span-1 flex flex-col">
          <h1 className="text-3xl lg:text-4xl font-bold mb-3">{product.name}</h1>
          {/* TODO: Afficher les étoiles de notation moyenne ici */}
          {/* <RatingStars rating={product.averageRating || 0} editable={false} /> */}
          <p className="text-2xl text-blue-600 font-semibold my-4">${product.price ? product.price.toFixed(2) : 'N/A'}</p>

          <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none mb-6">
            <p>{product.description || 'Aucune description disponible.'}</p>
          </div>

          <p className="text-sm text-gray-600 mb-1">
            Catégorie: <span className="font-medium">{product.category || 'Non classé'}</span>
          </p>
          <p className={`text-sm mb-4 font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock > 0 ? `En Stock (${product.stock} disponible(s))` : 'Épuisé'}
          </p>

          {product.stock > 0 && (
            <div className="flex items-center mb-6">
              <label htmlFor="quantity" className="mr-3 font-medium text-gray-700">Quantité:</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))} // Empêche <= 0
                className="w-20 p-2 border border-gray-300 rounded-md text-center focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || quantity < 1}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors
                        ${product.stock === 0 || quantity < 1
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75'
                        }`}
          >
            {product.stock === 0 ? 'Épuisé' : 'Ajouter au panier'}
          </button>
        </div>
      </div>

      {/* Section Avis */}
      <div className="my-12 pt-8 border-t">
        <h2 className="text-2xl font-semibold mb-6">Avis des Clients</h2>
        {/* TODO: Afficher les avis existants ici */}
        {/* <ReviewList reviews={product.reviews || []} /> */}
        <p className="text-gray-600 mb-4">(Placeholder pour la liste des avis)</p>
        {/* TODO: Permettre de soumettre un avis (si l'utilisateur est connecté et a acheté le produit?) */}
        <ReviewForm productId={productId} onSubmitSuccess={(newReview) => console.log('Avis soumis:', newReview)} />
      </div>

      {/* Section Produits Similaires/Recommandations */}
      <SimilarProducts currentProductId={productId} />
    </div>
  );
};

export default ProductDetailPage;
