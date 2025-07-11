// frontend/src/pages/SearchResultsPage.jsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useApi from '../hooks/useApi';
import ProductList from '../features/products/ProductList'; // Réutiliser ProductList pour l'affichage
import SearchBar from '../features/search/SearchBar'; // Optionnel: réafficher la barre de recherche

const SearchResultsPage = () => {
  const location = useLocation();
  const { fetchData, isLoading, error } = useApi();
  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1); // Pour la pagination future
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get('q');
    setSearchTerm(query || '');

    if (query) {
      const loadResults = async () => {
        try {
          // Modifier l'appel pour inclure la pagination si le backend la supporte pour la recherche
          const data = await fetchData(`/products/search?q=${encodeURIComponent(query)}&page=${page}&limit=12`);
          setResults(data.data || []);
          setTotalPages(data.totalPages || 1);
        } catch (err) {
          console.error("Erreur lors du chargement des résultats de recherche:", err);
          setResults([]);
        }
      };
      loadResults();
    } else {
      setResults([]); // Pas de requête, pas de résultats
    }
  }, [location.search, fetchData, page]);

  const handleSearchSubmit = (newQuery) => {
    // Naviguer vers la même page avec le nouveau terme de recherche
    // Ceci déclenchera le useEffect pour recharger les résultats
    // (Pas implémenté ici, car SearchBar dans le Header gère déjà la navigation ou la mise à jour globale)
    // Pour une barre de recherche spécifique à cette page, on mettrait à jour l'URL ici.
    console.log("Nouvelle recherche depuis la page de résultats (non implémenté) :", newQuery);
  };

  // TODO: Implémenter la pagination si totalPages > 1

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Optionnel: ré-afficher une barre de recherche ici */}
      {/* <div className="mb-8">
        <SearchBar onSearchSubmitted={handleSearchSubmit} />
      </div> */}

      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        Résultats de recherche pour : <span className="text-blue-600">"{searchTerm}"</span>
      </h1>

      <ProductList products={results} loading={isLoading} error={error?.message} />

      {/* TODO: Ajouter les contrôles de pagination ici */}
      {/* Exemple simple:
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Précédent</button>
            <span className="mx-4">Page {page} sur {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Suivant</button>
          </div>
        )}
      */}
    </div>
  );
};

export default SearchResultsPage;
