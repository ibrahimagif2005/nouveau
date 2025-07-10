// frontend/src/features/auth/RegisterForm.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, resetAuthStatus } from '../../redux/slices/authSlice'; // Assurez-vous que le chemin est correct
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, isError, message } // isSuccess peut aussi être utilisé
    = useSelector((state) => state.auth);

  const password = watch('password'); // Pour la confirmation du mot de passe

  React.useEffect(() => {
    return () => {
      dispatch(resetAuthStatus());
    };
  }, [dispatch]);

  const onSubmit = async (data) => {
    dispatch(resetAuthStatus());
    // Supprimer confirmPassword avant d'envoyer au backend
    const { confirmPassword, ...userData } = data;
    const resultAction = await dispatch(registerUser(userData));

    if (registerUser.fulfilled.match(resultAction)) {
      // Inscription réussie
      // Rediriger vers la page de connexion ou directement vers l'accueil si l'utilisateur est auto-connecté
      navigate('/login'); // ou '/' si auto-login
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-center mb-6">Créer un Compte</h2>
      {isError && message && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{message}</span>
        </div>
      )}
      {/* {isSuccess && message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{message}</span>
        </div>
      )} */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
          <input
            type="text"
            id="name"
            {...register('name', { required: 'Nom requis' })}
            className={`w-full p-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-blue-500 focus:border-blue-500`}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            id="email"
            {...register('email', {
              required: 'Email requis',
              pattern: { value: /^\S+@\S+$/i, message: 'Adresse email invalide' }
            })}
            className={`w-full p-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-blue-500 focus:border-blue-500`}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
          <input
            type="password"
            id="password"
            {...register('password', {
              required: 'Mot de passe requis',
              minLength: { value: 6, message: 'Le mot de passe doit contenir au moins 6 caractères' }
            })}
            className={`w-full p-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-blue-500 focus:border-blue-500`}
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
          <input
            type="password"
            id="confirmPassword"
            {...register('confirmPassword', {
              required: 'Veuillez confirmer le mot de passe',
              validate: value => value === password || 'Les mots de passe ne correspondent pas'
            })}
            className={`w-full p-3 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-blue-500 focus:border-blue-500`}
          />
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-150 disabled:opacity-50"
        >
          {isLoading ? 'Création du compte...' : "S'inscrire"}
        </button>
      </form>
       {/* <p className="text-center text-sm text-gray-600 mt-4">
        Déjà un compte? <Link to="/login" className="text-blue-600 hover:underline">Connectez-vous</Link>
      </p> */}
    </div>
  );
};

export default RegisterForm;
