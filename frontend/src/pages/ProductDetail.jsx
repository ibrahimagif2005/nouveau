// frontend/src/pages/ProductDetail.jsx
import React, { useEffect, useState } /*, { useEffect, useState } */ from 'react';
import { useParams } from 'react-router-dom';
// import api from '../services/api';
import { useDispatch, useSelector } from 'react-redux'; // Importer useSelector
import { addToCartAction } from '../redux/slices/cartSlice'; // Décommenter si utilisé directement
import { selectCurrentUser } from '../redux/slices/authSlice'; // Importer pour la wishlist
import ReviewForm from '../features/reviews/ReviewForm';
import SimilarProducts from '../features/recommendations/SimilarProducts';
import WishlistButton from '../features/wishlist/WishlistButton';
import StarRating from '../features/reviews/StarRating'; // Renommé et à utiliser
import ReviewList from '../features/reviews/ReviewList'; // Pour afficher les avis
import useApi from '../hooks/useApi'; // Pour charger les avis

const ProductDetailPage = () => {
  const { id: productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true); // Chargement du produit principal
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);

  const { fetchData: fetchProductData, isLoading: productIsLoading, error: productError } = useApi();
  const { fetchData: fetchReviewsData, isLoading: reviewsAreLoading, error: reviewsError } = useApi();
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const loadProductAndReviews = async () => {
      if (!productId) return;

      setLoading(true); // Indique le chargement global de la page
      setError(null);

      try {
        // Charger les détails du produit
        // Remplacer la simulation par l'appel réel
        // const productData = await fetchProductData(`/products/${productId}`);
        // setProduct(productData.data);

        // Simulation actuelle pour le produit
        setTimeout(() => {
          const mockProduct = productId === "1" ? {
            _id: '1', name: 'Produit Alpha Détaillé', price: 29.99, imageUrl: 'https://via.placeholder.com/600x400?text=Produit+Alpha',
            description: 'Ceci est une description détaillée et plus longue pour le Produit Alpha...', stock: 10, category: 'Électronique',
            averageRating: 4.5, numReviews: 2 // Ajout pour les étoiles
          } : {
            _id: productId, name: `Produit ${productId} Détaillé`, price: Math.floor(Math.random() * 100) + 20,
            imageUrl: `https://via.placeholder.com/600x400?text=Produit+${productId}`, description: `Description pour ${productId}.`,
            stock: Math.floor(Math.random() * 20) + 5, category: 'Divers', averageRating: 3.2, numReviews: 5
          };
          setProduct(mockProduct);
        }, 500);

        // Charger les avis pour le produit
        // const reviewsData = await fetchReviewsData(`/products/${productId}/reviews`);
        // setReviews(reviewsData.data || []);

        // Simulation pour les avis
         setTimeout(() => {
            setReviews([
                { _id: 'r1', user: { name: 'Alice' }, rating: 5, title: 'Excellent!', comment: 'Super produit, je recommande vivement.', createdAt: new Date().toISOString() },
                { _id: 'r2', user: { name: 'Bob' }, rating: 4, comment: 'Bon produit, conforme à la description.', createdAt: new Date(Date.now() - 86400000).toISOString() }, // Hier
            ]);
        }, 700);


      } catch (err) {
        console.error(`Erreur de chargement pour la page produit ${productId}:`, err);
        setError(err.message || 'Impossible de charger les informations.');
      } finally {
        setLoading(false); // Chargement global terminé
      }
    };

    loadProductAndReviews();
  }, [productId, fetchProductData, fetchReviewsData]); // fetchProductData et fetchReviewsData sont stables grâce à useCallback dans useApi

  const handleReviewSubmitted = (newReview) => {
    // Mettre à jour la liste des avis avec le nouvel avis, ou re-fetcher la liste
    setReviews(prevReviews => [newReview, ...prevReviews]);
    // Idéalement, le backend renverrait le produit mis à jour avec la nouvelle note moyenne,
    // ou on pourrait re-fetcher le produit.
    // Pour l'instant, on pourrait simuler la mise à jour de la note.
    if (product) {
        // Ceci est une simulation, la vraie mise à jour viendrait du backend ou d'un re-fetch
        const newNumReviews = (product.numReviews || 0) + 1;
        const newAverageRating = (((product.averageRating || 0) * (product.numReviews || 0)) + newReview.rating) / newNumReviews;
        setProduct(prev => ({...prev, averageRating: parseFloat(newAverageRating.toFixed(1)), numReviews: newNumReviews }));
    }
  };

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
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-3xl lg:text-4xl font-bold flex-grow">{product.name}</h1>
            <div className="flex-shrink-0 ml-4 mt-1"> {/* Ajustement du margin top pour alignement */}
              <WishlistButton productId={product?._id || product?.id} initialIsInWishlist={currentUser?.wishlist?.some(item => (item._id || item) === (product?._id || product?.id)) || false} />
            </div>
          </div>
          <div className="flex items-center mb-3">
            <StarRating rating={product.averageRating || 0} editable={false} />
            {product.numReviews > 0 && (
              <span className="ml-2 text-sm text-gray-600">({product.numReviews} avis)</span>
            )}
          </div>
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
        <h2 className="text-2xl font-semibold mb-6">Avis des Clients ({product.numReviews || 0})</h2>
        <ReviewList reviews={reviews} isLoading={reviewsAreLoading} error={reviewsError} />
        {/* TODO: Conditionner l'affichage de ReviewForm (ex: si utilisateur connecté et n'a pas déjà posté) */}
        {currentUser && (
            <ReviewForm productId={productId} onSubmitSuccess={handleReviewSubmitted} />
        )}
      </div>

      {/* Section Produits Similaires/Recommandations */}
      <SimilarProducts currentProductId={productId} />
    </div>
  );
};

export default ProductDetailPage;
