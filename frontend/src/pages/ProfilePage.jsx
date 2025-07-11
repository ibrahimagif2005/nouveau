// frontend/src/pages/ProfilePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import useApi from '../hooks/useApi';
import UserForm from '../features/profile/UserForm';
import OrderHistory from '../features/profile/OrderHistory';
import { useDispatch } from 'react-redux'; // Pour mettre à jour le user dans Redux après modif
import { fetchUser } from '../redux/slices/authSlice'; // Pour re-fetcher ou mettre à jour l'utilisateur

const ProfilePage = () => {
  // Utiliser des états séparés pour le chargement et les erreurs de chaque appel API
  const { fetchData: fetchProfileData, isLoading: profileIsLoading, error: profileError } = useApi();
  const { fetchData: fetchOrdersData, isLoading: ordersAreLoading, error: ordersError } = useApi();
  const { fetchData: updateProfileData, isLoading: updateIsLoading, error: updateError } = useApi();

  const [userProfile, setUserProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [updateSuccessMessage, setUpdateSuccessMessage] = useState('');
  const dispatch = useDispatch();

  const loadProfileAndOrders = useCallback(async () => {
    try {
      const profileData = await fetchProfileData('/users/profile');
      if (profileData.success) {
        setUserProfile(profileData.data);
      } else {
        // Gérer l'erreur de chargement du profil
      }
    } catch (err) {
      // Erreur déjà gérée par useApi, mais on peut logguer ici aussi
      console.error("Erreur chargement profil:", err);
    }

    try {
      const ordersData = await fetchOrdersData('/users/orders');
      if (ordersData.success) {
        setOrders(ordersData.data);
      } else {
        // Gérer l'erreur de chargement des commandes
      }
    } catch (err) {
      console.error("Erreur chargement commandes:", err);
    }
  }, [fetchProfileData, fetchOrdersData]);

  useEffect(() => {
    loadProfileAndOrders();
  }, [loadProfileAndOrders]);

  const handleProfileUpdate = async (formData) => {
    setUpdateSuccessMessage('');
    try {
      const response = await updateProfileData('/users/profile', 'PUT', formData);
      if (response.success) {
        setUserProfile(response.data); // Mettre à jour le profil localement
        dispatch(fetchUser()); // Re-fetcher l'utilisateur pour mettre à jour le store Redux global
        setUpdateSuccessMessage(response.message || 'Profil mis à jour avec succès !');
        setTimeout(() => setUpdateSuccessMessage(''), 3000); // Cacher le message après 3s
      } else {
        // L'erreur est gérée par updateError de useApi
      }
    } catch (err) {
      // Erreur déjà gérée par useApi
      console.error("Erreur de mise à jour du profil:", err);
    }
  };

  if (profileIsLoading && !userProfile) { // Afficher le chargement initial du profil
    return <div className="container mx-auto p-4 text-center">Chargement du profil...</div>;
  }

  // Afficher une erreur principale si le profil n'a pas pu être chargé
  if (profileError && !userProfile) {
      return <div className="container mx-auto p-4 text-center text-red-500">Erreur de chargement du profil: {profileError.message}</div>;
  }

  // Si userProfile n'est toujours pas défini (cas improbable si pas d'erreur et pas de chargement)
  if (!userProfile) {
      return <div className="container mx-auto p-4 text-center">Impossible de charger les informations du profil.</div>;
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Mon Espace Client</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <UserForm
            user={userProfile}
            onSubmit={handleProfileUpdate}
            isLoading={updateIsLoading}
            error={updateError?.message} // Passer le message d'erreur spécifique à la mise à jour
            successMessage={updateSuccessMessage}
          />
        </div>
        <div className="lg:col-span-2">
          <OrderHistory
            orders={orders}
            isLoading={ordersAreLoading && orders.length === 0} // Afficher chargement si pas encore de commandes
            error={ordersError}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
