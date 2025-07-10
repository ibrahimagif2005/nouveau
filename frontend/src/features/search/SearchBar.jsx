// frontend/src/features/search/SearchBar.jsx
import React, { useState } from 'react';
// import { FaSearch } from 'react-icons/fa'; // Optionnel

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm.trim());
    }
    // Idéalement, ici, on pourrait aussi naviguer vers une page de résultats de recherche
    // ou mettre à jour un état global qui déclenche l'affichage des résultats.
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center w-full max-w-xl mx-auto my-4">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Rechercher des produits..."
        className="w-full p-3 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
        aria-label="Rechercher des produits"
      />
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-r-md transition-colors"
        aria-label="Lancer la recherche"
      >
        {/* <FaSearch size={20}/> */}
        Rechercher
      </button>
    </form>
  );
};

export default SearchBar;
