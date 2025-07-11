// frontend/src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import ProductList from '../features/products/ProductList';
import ProductFilters from '../features/products/ProductFilters'; // Ajout des filtres
import useApi from '../hooks/useApi'; // Utilisation du hook personnalisé

const HomePage = () => {
  const [products, setProducts] = useState([]);
  // isLoading et error sont maintenant gérés par useApi et passés à ProductList
  const { fetchData, isLoading: apiIsLoading, error: apiError } = useApi();
  const [filteredProducts, setFilteredProducts] = useState([]);
  // État pour les filtres (exemple)
  const [activeFilters, setActiveFilters] = useState({
    category: '',
    priceRange: '', // Pourrait être un objet {min, max}
    searchTerm: '',
  });

  useEffect(() => {
    const fetchProductsData = async () => {
      try {
        // Remplacer la simulation par un appel réel si l'API est prête
        const result = await fetchData('/products'); // Endpoint API pour les produits
        setProducts(result.data || []); // Supposant que les produits sont dans result.data
        setFilteredProducts(result.data || []); // Initialiser les produits filtrés
      } catch (err) {
        // L'erreur est déjà gérée par useApi, mais on peut logger ici si besoin
        console.error("Erreur spécifique à HomePage lors du chargement des produits:", err);
        // apiError sera mis à jour par le hook useApi
        setProducts([]); // S'assurer que products est vide en cas d'erreur
        setFilteredProducts([]);
      }
    };

    // Simulation actuelle (à remplacer par fetchProductsData quand l'API est prête)
    const simulateFetch = () => {
        setTimeout(() => {
          const mockProducts = [
            { id: '1', name: 'Produit Alpha', price: 29.99, category: 'electronique', imageUrl: 'https://via.placeholder.com/300x200?text=Produit+Alpha', description: 'Description brève du produit Alpha.' },
            { id: '2', name: 'Produit Beta', price: 49.99, category: 'vetements', imageUrl: 'https://via.placeholder.com/300x200?text=Produit+Beta', description: 'Description brève du produit Beta.' },
            { id: '3', name: 'Produit Gamma', price: 19.99, category: 'maison', imageUrl: 'https://via.placeholder.com/300x200?text=Produit+Gamma', description: 'Description brève du produit Gamma.' },
            { id: '4', name: 'Produit Delta Électronique', price: 99.99, category: 'electronique', imageUrl: 'https://via.placeholder.com/300x200?text=Produit+Delta', description: 'Description brève du produit Delta.' },
          ];
          setProducts(mockProducts);
          setFilteredProducts(mockProducts); // Initialiser avec tous les produits
        }, 500); // Réduit pour des tests plus rapides
    };

    fetchProductsData(); // Utiliser l'appel API réel maintenant
    // simulateFetch(); // Commenter la simulation


  }, [fetchData]); // fetchData est mémorisé par useCallback, donc stable

  // Logique de filtrage (exemple simple)
  useEffect(() => {
    let tempProducts = [...products];
    if (activeFilters.category) {
      tempProducts = tempProducts.filter(p => p.category === activeFilters.category);
    }
    if (activeFilters.searchTerm) {
      tempProducts = tempProducts.filter(p =>
        p.name.toLowerCase().includes(activeFilters.searchTerm.toLowerCase())
      );
    }
    // Ajouter la logique pour priceRange ici
    setFilteredProducts(tempProducts);
  }, [activeFilters, products]);


  // Fonctions pour mettre à jour les filtres depuis ProductFilters
  const handleCategoryChange = (category) => {
    setActiveFilters(prev => ({ ...prev, category }));
  };
  const handlePriceChange = (priceValue) => { // Simplifié
    setActiveFilters(prev => ({ ...prev, priceRange: priceValue }));
  };
  const handleSearchChange = (searchTerm) => {
    setActiveFilters(prev => ({ ...prev, searchTerm }));
  };

  // Exemple de catégories pour le filtre (pourrait venir de l'API)
  const categoriesExample = [
    { name: 'Électronique', slug: 'electronique' },
    { name: 'Vêtements', slug: 'vetements' },
    { name: 'Maison', slug: 'maison' },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Nos Produits</h1>
      <ProductFilters
        categories={categoriesExample}
        onCategoryChange={handleCategoryChange}
        onPriceChange={handlePriceChange} // À implémenter plus en détail
        onSearchChange={handleSearchChange}
        // currentFilters={activeFilters} // Passer les filtres actuels si ProductFilters en a besoin
      />
      <ProductList products={filteredProducts} loading={apiIsLoading} error={apiError?.message} />
    </div>
  );
};

export default HomePage;
