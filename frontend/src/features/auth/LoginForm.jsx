// frontend/src/features/auth/LoginForm.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, resetAuthStatus } from '../../redux/slices/authSlice'; // Assurez-vous que le chemin est correct
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, isError, message } = useSelector((state) => state.auth);

  React.useEffect(() => {
    // Réinitialiser le statut d'erreur/message lors du démontage ou avant une nouvelle soumission
    return () => {
      dispatch(resetAuthStatus());
    };
  }, [dispatch]);

  const onSubmit = async (data) => {
    dispatch(resetAuthStatus()); // Réinitialiser avant une nouvelle tentative
    const resultAction = await dispatch(loginUser(data));
    if (loginUser.fulfilled.match(resultAction)) {
      // Connexion réussie, message de succès est dans state.auth.message
      // Rediriger l'utilisateur, par exemple vers la page d'accueil ou son profil
      navigate('/'); // Ou une autre page de destination après connexion
    }
    // Si loginUser.rejected, le message d'erreur est déjà dans state.auth.message
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-center mb-6">Connexion</h2>
      {isError && message && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{message}</span>
        </div>
      )}
      {/* Afficher un message de succès si pertinent, bien que la redirection soit souvent suffisante */}
      {/* {isSuccess && message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{message}</span>
        </div>
      )} */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            id="email"
            {...register('email', {
              required: 'Email requis',
              pattern: {
                value: /^\S+@\S+$/i,
                message: 'Adresse email invalide'
              }
            })}
            className={`w-full p-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-blue-500 focus:border-blue-500`}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
          <input
            type="password"
            id="password"
            {...register('password', { required: 'Mot de passe requis' })}
            className={`w-full p-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-blue-500 focus:border-blue-500`}
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-150 disabled:opacity-50"
        >
          {isLoading ? 'Connexion en cours...' : 'Se connecter'}
        </button>
      </form>
      {/* Optionnel: Lien vers la page d'inscription */}
      {/* <p className="text-center text-sm text-gray-600 mt-4">
        Pas encore de compte? <Link to="/register" className="text-blue-600 hover:underline">Inscrivez-vous</Link>
      </p> */}
    </div>
  );
};

export default LoginForm;
