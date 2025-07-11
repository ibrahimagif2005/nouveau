// frontend/src/features/profile/UserForm.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

const UserForm = ({ user, onSubmit, isLoading, error, successMessage }) => {
  const { register, handleSubmit, setValue, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      name: '',
      email: '',
      address: ''
    }
  });

  // Mettre à jour les valeurs du formulaire lorsque les props utilisateur changent
  useEffect(() => {
    if (user) {
      setValue('name', user.name || '');
      setValue('email', user.email || '');
      setValue('address', user.address || '');
    }
  }, [user, setValue]);

  const handleFormSubmit = (data) => {
    if (onSubmit) {
      onSubmit(data);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Informations Personnelles</h3>

      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
      {successMessage && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md">{successMessage}</p>}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
        <input
          type="text"
          id="name"
          {...register('name', { required: 'Le nom est requis' })}
          className={`w-full p-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-blue-500 focus:border-blue-500`}
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Adresse Email</label>
        <input
          type="email"
          id="email"
          {...register('email', {
            required: 'L\'email est requis',
            pattern: { value: /^\S+@\S+$/i, message: 'Adresse email invalide' }
          })}
          className={`w-full p-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-blue-500 focus:border-blue-500`}
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Adresse de livraison principale</label>
        <textarea
          id="address"
          rows="3"
          {...register('address')}
          placeholder="Ex: 123 Rue de l'Exemple, 75000 Paris"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* TODO: Ajouter la modification du mot de passe via un flux séparé/modal */}
      {/* <div className="pt-2">
        <button type="button" className="text-sm text-blue-600 hover:underline">Changer le mot de passe</button>
      </div> */}

      <button
        type="submit"
        disabled={isLoading || !isDirty} // Désactiver si chargement ou si le formulaire n'a pas été modifié
        className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Sauvegarde...' : 'Enregistrer les modifications'}
      </button>
    </form>
  );
};

export default UserForm;
