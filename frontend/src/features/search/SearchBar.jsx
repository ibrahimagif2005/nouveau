// frontend/src/features/search/SearchBar.jsx
import React, { useState, useEffect, useRef } from 'react';
import useApi from '../../hooks/useApi'; // Ajustez le chemin si nécessaire
import SearchResultItem from './SearchResultItem';
import { useNavigate } from 'react-router-dom';
// import { FaSearch, FaTimes } from 'react-icons/fa'; // Optionnel

const SearchBar = ({ onSearchSubmitted }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const { fetchData, isLoading, error } = useApi();
  const navigate = useNavigate();
  const searchContainerRef = useRef(null); // Pour détecter les clics en dehors

  // Debounce pour la recherche
  useEffect(() => {
    if (query.length < 2) { // Ne pas rechercher si la requête est trop courte
      setResults([]);
      setShowResults(false);
      return;
    }

    const handler = setTimeout(async () => {
      try {
        const data = await fetchData(`/products/search?q=${encodeURIComponent(query)}&limit=5`); // Limiter les résultats de la dropdown
        setResults(data.data || []);
        setShowResults(true);
      } catch (err) {
        console.error("Erreur de recherche:", err);
        setResults([]);
        setShowResults(true); // Afficher "aucun résultat" ou erreur
      }
    }, 300); // Délai de debounce

    return () => clearTimeout(handler);
  }, [query, fetchData]);

  // Gérer les clics en dehors pour fermer la liste des résultats
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchContainerRef]);


  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setShowResults(false); // Cacher la dropdown
    if (query.trim()) {
      if (onSearchSubmitted) {
        onSearchSubmitted(query.trim()); // Pour une page de résultats dédiée
      } else {
        // Comportement par défaut si pas de handler: naviguer vers une page de recherche
        navigate(`/search-results?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  const handleResultSelect = () => {
      setShowResults(false); // Ferme la liste après sélection
      // La navigation est gérée par le Link dans SearchResultItem
  };

  return (
    <div ref={searchContainerRef} className="relative w-full max-w-lg mx-auto"> {/* Ajustez la largeur max si besoin */}
      <form onSubmit={handleFormSubmit} className="flex items-center">
        <div className="relative w-full">
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={() => query.length > 1 && setShowResults(true)} // Afficher si déjà des résultats
              placeholder="Rechercher un produit..."
              className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
              aria-label="Rechercher des produits"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {/* <FaSearch /> */} 🔍
            </span>
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label="Effacer la recherche"
              >
                {/* <FaTimes /> */} ✕
              </button>
            )}
        </div>
        {/* Le bouton de soumission peut être optionnel si la recherche est dynamique ou si on navigue en sélectionnant un item */}
        {/* <button
          type="submit"
          className="ml-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-md transition-colors"
          aria-label="Lancer la recherche"
        >
          Rechercher
        </button> */}
      </form>

      {showResults && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-y-auto">
          {isLoading && <div className="p-3 text-sm text-gray-500">Recherche en cours...</div>}
          {error && <div className="p-3 text-sm text-red-500">Erreur: {error.message}</div>}
          {!isLoading && !error && results.length === 0 && query.length > 1 && (
            <div className="p-3 text-sm text-gray-500">Aucun résultat pour "{query}".</div>
          )}
          {!isLoading && !error && results.length > 0 && (
            results.map(product => (
              <SearchResultItem key={product._id || product.id} product={product} onSelect={handleResultSelect} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
