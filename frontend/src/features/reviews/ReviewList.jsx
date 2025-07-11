// frontend/src/features/reviews/ReviewList.jsx
import React from 'react';
import StarRating from './StarRating'; // Pour afficher la note de chaque avis
import { format } from 'date-fns'; // Pour formater la date
import { fr } from 'date-fns/locale'; // Pour la locale française

const ReviewItem = ({ review }) => {
  return (
    <div className="py-4 border-b border-gray-200 last:border-b-0">
      <div className="flex items-center mb-1">
        <StarRating rating={review.rating} editable={false} size="text-lg" />
        {review.title && <h4 className="ml-3 font-semibold text-gray-800">{review.title}</h4>}
      </div>
      <p className="text-xs text-gray-500 mb-1">
        Par {review.user?.name || 'Utilisateur anonyme'} le {format(new Date(review.createdAt), 'd MMMM yyyy', { locale: fr })}
      </p>
      <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
      {/* TODO: Options pour modifier/supprimer l'avis si c'est l'auteur ou un admin */}
    </div>
  );
};

const ReviewList = ({ reviews, isLoading, error }) => {
  if (isLoading) {
    return <p className="text-gray-600">Chargement des avis...</p>;
  }

  if (error) {
    return <p className="text-red-500">Erreur lors du chargement des avis: {error.message || error}</p>;
  }

  if (!reviews || reviews.length === 0) {
    return <p className="text-gray-600">Aucun avis pour ce produit pour le moment.</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map(review => (
        <ReviewItem key={review._id || review.id} review={review} />
      ))}
      {/* TODO: Ajouter la pagination pour les avis si nécessaire */}
    </div>
  );
};

export default ReviewList;
