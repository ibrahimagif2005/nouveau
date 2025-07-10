// frontend/src/features/products/ProductFilters.jsx
import React from 'react';

const ProductFilters = ({ categories, onCategoryChange, onPriceChange, onSearchChange, currentFilters }) => {
  // currentFilters pourrait être un objet { category: '', priceRange: '', searchTerm: '' }

  const handleCategoryFilter = (e) => {
    onCategoryChange(e.target.value);
  };

  const handlePriceFilter = (e) => {
    // Logique pour gérer la plage de prix (slider, inputs min/max, etc.)
    onPriceChange(e.target.value); // Simplifié pour l'exemple
  };

  const handleSearchInput = (e) => {
    onSearchChange(e.target.value);
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow mb-6">
      <h3 className="text-xl font-semibold mb-4">Filtrer les Produits</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Filtre par catégorie */}
        <div>
          <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Catégorie
          </label>
          <select
            id="category-filter"
            name="category"
            // value={currentFilters.category}
            onChange={handleCategoryFilter}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Toutes</option>
            {categories && categories.map(cat => (
              <option key={cat.id || cat.name} value={cat.slug || cat.name}>{cat.name}</option>
            ))}
            {/* Exemple statique si pas de categories dynamiques */}
            {!categories && (
              <>
                <option value="electronique">Électronique</option>
                <option value="vetements">Vêtements</option>
                <option value="maison">Maison</option>
              </>
            )}
          </select>
        </div>

        {/* Filtre par prix (exemple simple) */}
        <div>
          <label htmlFor="price-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Gamme de Prix (Placeholder)
          </label>
          <input
            type="range" // Ou des inputs min/max
            id="price-filter"
            name="price"
            min="0"
            max="1000" // A ajuster
            // value={currentFilters.priceRange}
            onChange={handlePriceFilter}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          {/* Afficher la valeur sélectionnée */}
        </div>

        {/* Recherche textuelle */}
        <div>
          <label htmlFor="search-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Rechercher
          </label>
          <input
            type="text"
            id="search-filter"
            name="search"
            // value={currentFilters.searchTerm}
            onChange={handleSearchInput}
            placeholder="Nom du produit..."
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
