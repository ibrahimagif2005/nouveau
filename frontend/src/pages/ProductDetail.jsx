// frontend/src/pages/ProductDetail.jsx
import React, { useEffect, useState } /*, { useEffect, useState } */ from 'react';
import { useParams } from 'react-router-dom';
// import api from '../services/api';
// import { useDispatch } from 'react-redux';
// import { addToCartAction } from '../redux/slices/cartSlice';

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img src={product.imageUrl} alt={product.name} className="w-full h-auto max-h-[500px] object-contain rounded-lg shadow-md" />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-3">{product.name}</h1>
          <p className="text-2xl text-blue-600 font-semibold mb-4">${product.price.toFixed(2)}</p>
          <p className="text-gray-700 mb-4">{product.description}</p>
          <p className="text-sm text-gray-600 mb-1">Catégorie: {product.category}</p>
          <p className={`text-sm mb-4 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            Stock: {product.stock > 0 ? `${product.stock} disponible(s)` : 'Épuisé'}
          </p>

          {product.stock > 0 && (
            <div className="flex items-center mb-6">
              <label htmlFor="quantity" className="mr-3 font-medium">Quantité:</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-20 p-2 border border-gray-300 rounded-md text-center"
              />
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || quantity < 1}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors
                        ${product.stock === 0 || quantity < 1
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-700'
                        }`}
          >
            {product.stock === 0 ? 'Épuisé' : 'Ajouter au panier'}
          </button>
        </div>
      </div>
      {/* Section pour les avis, produits similaires, etc. peut être ajoutée ici */}
    </div>
  );
};

export default ProductDetailPage;
