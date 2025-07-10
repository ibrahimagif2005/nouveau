// frontend/src/hooks/useApi.js
import { useState, useCallback } from 'react';
import axiosInstance from '../services/api'; // Utiliser l'instance Axios configurée
// import { useDispatch } from 'react-redux';
// import { logoutUser } from '../redux/slices/authSlice'; // Pour déconnecter en cas de 401 persistant

const useApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // const dispatch = useDispatch(); // Pourrait être utilisé pour des actions globales comme la déconnexion

  // useCallback pour mémoriser la fonction fetchData et éviter des re-render inutiles
  // si ce hook est utilisé dans des composants qui dépendent de sa référence.
  const fetchData = useCallback(async (url, method = 'get', data = null, options = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance({
        url,
        method,
        data, // Pour les requêtes POST, PUT, PATCH
        params: method.toLowerCase() === 'get' ? data : null, // Pour les requêtes GET (data devient query params)
        ...options, // Permet de surcharger d'autres options Axios si nécessaire
      });
      setIsLoading(false);
      return response.data; // Retourne directement les données de la réponse
    } catch (err) {
      setIsLoading(false);
      // Tenter de récupérer le message d'erreur du backend, sinon message d'erreur Axios/générique
      const errorMessage = err.response?.data?.message || err.message || 'Une erreur est survenue lors de la requête API.';
      setError({ message: errorMessage, status: err.response?.status });
      console.error("Erreur API dans useApi:", err.response || err);

      // Gestion centralisée des erreurs spécifiques si nécessaire
      // Par exemple, si un 401 persistant signifie que le token est invalide et irrécupérable :
      // if (err.response?.status === 401) {
      //   // dispatch(logoutUser()); // Déconnecter l'utilisateur
      //   // Rediriger vers la page de connexion
      // }

      // Propager l'erreur pour que le composant appelant puisse aussi la gérer s'il le souhaite
      // ou simplement afficher l'erreur stockée dans le state du hook.
      throw { message: errorMessage, status: err.response?.status, originalError: err };
    }
  }, []); // Les dépendances de useCallback sont vides car axiosInstance et les autres fonctions sont stables.

  return { fetchData, isLoading, error, setError, setIsLoading };
};

export default useApi;

/*
  Exemple d'utilisation dans un composant :

  import React, { useEffect, useState } from 'react';
  import useApi from '../hooks/useApi';

  const MyComponent = () => {
    const { fetchData, isLoading, error } = useApi();
    const [myData, setMyData] = useState(null);

    useEffect(() => {
      const loadData = async () => {
        try {
          const result = await fetchData('/mon-endpoint'); // GET par défaut
          setMyData(result);
        } catch (apiError) {
          // L'erreur est déjà gérée et loggée par useApi,
          // mais on peut ajouter une logique spécifique ici si besoin.
          console.error("Erreur spécifique au composant:", apiError.message);
        }
      };
      loadData();
    }, [fetchData]); // fetchData est mémorisé par useCallback

    if (isLoading) return <p>Chargement...</p>;
    if (error) return <p>Erreur: {error.message}</p>;
    if (!myData) return <p>Aucune donnée.</p>;

    return (
      <div>
        { // Afficher myData }
      </div>
    );
  };
*/
