// frontend/src/features/reviews/ReviewForm.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import StarRating from './StarRating';
import useApi from '../../hooks/useApi'; // Importer useApi
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsLoggedIn } from '../../redux/slices/authSlice';

const ReviewForm = ({ productId, onSubmitSuccess, onCancel }) => {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    defaultValues: { rating: 0, title: '', comment: '' }
  });

  const { fetchData, isLoading, error: apiFormError, setError: setApiFormError } = useApi();
  const currentUser = useSelector(selectCurrentUser);
  const isLoggedIn = useSelector(selectIsLoggedIn);

  const [hasReviewed, setHasReviewed] = useState(false);
  const [checkingReview, setCheckingReview] = useState(true); // Pour l'état de chargement de la vérification

  const currentRating = watch('rating');

  // Enregistrer le champ rating pour la validation useForm
  useEffect(() => {
    register('rating', { required: 'Une note est requise', min: { value: 1, message: 'Veuillez donner au moins 1 étoile.'} });
  }, [register]);

  // Vérifier si l'utilisateur a déjà soumis un avis pour ce produit
  useEffect(() => {
    const checkExistingReview = async () => {
      if (!isLoggedIn || !productId) {
        setHasReviewed(false);
        setCheckingReview(false);
        return;
      }
      setCheckingReview(true);
      try {
        // Note: L'endpoint /api/reviews/user-check/:productId a été créé
        const response = await fetchData(`/reviews/user-check/${productId}`);
        setHasReviewed(response.exists);
      } catch (error) {
        // Si l'API échoue (ex: 404 si le produit n'a pas d'avis de cet user), on suppose qu'il n'a pas évalué
        setHasReviewed(false);
        console.error("Erreur lors de la vérification de l'avis existant:", error);
      } finally {
        setCheckingReview(false);
      }
    };
    checkExistingReview();
  }, [productId, isLoggedIn, fetchData]);


  const handleRatingChange = (newRating) => {
    setValue('rating', newRating, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = async (data) => {
    if (hasReviewed) {
      setApiFormError({ message: "Vous avez déjà soumis un avis pour ce produit." });
      return;
    }
    setApiFormError(null); // Réinitialiser l'erreur API du formulaire

    const reviewData = {
      rating: data.rating,
      title: data.title,
      comment: data.comment,
    };

    try {
      const response = await fetchData(`/products/${productId}/reviews`, 'POST', reviewData);
      if (response.success) {
        if(onSubmitSuccess) onSubmitSuccess(response.data);
        reset(); // Réinitialiser le formulaire
        setHasReviewed(true); // Marquer comme ayant évalué
      } else {
        // L'erreur de useApi (apiFormError) devrait déjà être définie si l'API renvoie une erreur structurée
        // Sinon, on peut définir un message générique ici.
        setApiFormError({ message: response.message || 'Erreur lors de la soumission de l\'avis.' });
      }
    } catch (err) {
      // L'erreur est déjà capturée par useApi et stockée dans apiFormError
      console.error("Erreur API soumission avis:", err);
       // S'assurer qu'un message est affiché si apiFormError n'a pas été mis à jour par useApi
      if (!apiFormError) setApiFormError({ message: err.message || 'Une erreur est survenue.' });
    }
  };

  if (!isLoggedIn) {
    return <p className="text-sm text-gray-600 my-6 p-4 bg-gray-50 rounded-md">Veuillez <a href="/login" className="text-blue-600 hover:underline">vous connecter</a> pour laisser un avis.</p>;
  }

  if (checkingReview) {
    return <p className="text-sm text-gray-600 my-6">Vérification de votre statut d'avis...</p>;
  }

  if (hasReviewed) {
    return <p className="text-sm text-green-600 my-6 p-4 bg-green-50 rounded-md">Merci, vous avez déjà laissé un avis pour ce produit !</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-md my-6 border border-gray-200">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Laissez votre avis</h3>
      {apiFormError && <p className="text-red-500 text-sm mb-3 p-3 bg-red-50 rounded-md">{apiFormError.message}</p>}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Votre note *</label>
        <StarRating rating={currentRating} onRate={handleRatingChange} editable={true} />
        {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating.message}</p>}
      </div>

      <div className="mb-4">
        <label htmlFor="reviewTitle" className="block text-sm font-medium text-gray-700 mb-1">
          Titre de votre avis (optionnel)
        </label>
        <input
          type="text"
          id="reviewTitle"
          {...register('title', { maxLength: { value: 100, message: 'Le titre ne doit pas dépasser 100 caractères.' }})}
          className={`w-full p-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-blue-500 focus:border-blue-500`}
        />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
      </div>

      <div className="mb-4">
        <label htmlFor="reviewComment" className="block text-sm font-medium text-gray-700 mb-1">
          Votre commentaire *
        </label>
        <textarea
          id="reviewComment"
          rows="4"
          {...register('comment', {
            required: 'Un commentaire est requis.',
            minLength: { value: 10, message: 'Votre commentaire doit contenir au moins 10 caractères.' },
            maxLength: { value: 1000, message: 'Votre commentaire ne doit pas dépasser 1000 caractères.'}
          })}
          className={`w-full p-2 border ${errors.comment ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-blue-500 focus:border-blue-500`}
        />
        {errors.comment && <p className="text-red-500 text-xs mt-1">{errors.comment.message}</p>}
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Envoi...' : 'Soumettre l\'avis'}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
