// frontend/src/features/reviews/RatingStars.jsx
import React, { useState } from 'react';
// import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa'; // Pour des étoiles plus jolies

const RatingStars = ({ rating, onRatingChange, editable = true, size = 24 }) => {
  const [hoverRating, setHoverRating] = useState(0); // Pour l'effet de survol lors de la notation

  const handleStarClick = (index) => {
    if (editable && onRatingChange) {
      onRatingChange(index);
    }
  };

  const handleMouseEnter = (index) => {
    if (editable) {
      setHoverRating(index);
    }
  };

  const handleMouseLeave = () => {
    if (editable) {
      setHoverRating(0); // Réinitialiser le survol
    }
  };

  const stars = [];
  const displayRating = hoverRating > 0 ? hoverRating : rating;

  for (let i = 1; i <= 5; i++) {
    let starIcon;
    if (i <= displayRating) {
      // starIcon = <FaStar color="#ffc107" size={size} />;
      starIcon = <span style={{color: '#ffc107', fontSize: `${size}px`}}>★</span>;
    } else {
      // starIcon = <FaRegStar color="#e0e0e0" size={size} />;
      starIcon = <span style={{color: '#e0e0e0', fontSize: `${size}px`}}>☆</span>;
    }
    // Pour les demi-étoiles (plus complexe, à ajouter si nécessaire)
    // else if (i === Math.ceil(displayRating) && !Number.isInteger(displayRating)) {
    //   starIcon = <FaStarHalfAlt color="#ffc107" size={size} />;
    // }

    stars.push(
      <button
        key={i}
        type="button" // Important pour ne pas soumettre un formulaire parent
        onClick={() => handleStarClick(i)}
        onMouseEnter={() => handleMouseEnter(i)}
        onMouseLeave={handleMouseLeave}
        disabled={!editable}
        className={`focus:outline-none ${editable ? 'cursor-pointer' : 'cursor-default'}`}
        aria-label={`Noter ${i} étoiles`}
      >
        {starIcon}
      </button>
    );
  }

  return <div className="flex items-center">{stars}</div>;
};

export default RatingStars;
