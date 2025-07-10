// frontend/src/features/reviews/ReviewForm.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import RatingStars from './RatingStars';
// import useApi from '../../hooks/useApi'; // Pour soumettre l'avis

const ReviewForm = ({ productId, onSubmitSuccess, onCancel }) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: { rating: 0, title: '', comment: '' }
  });
  const [formError, setFormError] = useState('');
  // const { fetchData, isLoading, error: apiError } = useApi(); // Exemple avec useApi

  const currentRating = watch('rating');

  React.useEffect(() => {
    register('rating', { required: 'Une note est requise', min: { value: 1, message: 'Veuillez donner au moins 1 étoile.'} });
  }, [register]);

  const handleRatingChange = (newRating) => {
    setValue('rating', newRating, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    setFormError('');
    console.log('Avis soumis (placeholder):', { productId, ...data });
    // try {
    //   // const response = await fetchData(`/products/${productId}/reviews`, 'POST', data);
    //   // if (response.success) {
    //   //   if(onSubmitSuccess) onSubmitSuccess(response.data);
    //   // } else {
    //   //   setFormError(response.message || 'Erreur lors de la soumission de l\'avis.');
    //   // }
    //   // Simulation de succès
          if(onSubmitSuccess) onSubmitSuccess({productId, ...data, id: Date.now()}); // Simuler un ID d'avis
    // } catch (err) {
    //   // setFormError(err.message || 'Une erreur est survenue.');
    //   console.error("Erreur API soumission avis:", err);
    // }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-md my-6">
      <h3 className="text-xl font-semibold mb-4">Laissez votre avis</h3>
      {formError && <p className="text-red-500 text-sm mb-3">{formError}</p>}
      {/* {apiError && <p className="text-red-500 text-sm mb-3">{apiError.message}</p>} */}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Votre note *</label>
        <RatingStars rating={currentRating} onRatingChange={handleRatingChange} />
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
          // disabled={isLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {/* {isLoading ? 'Envoi...' : 'Soumettre l\'avis'} */}
          Soumettre l'avis
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
