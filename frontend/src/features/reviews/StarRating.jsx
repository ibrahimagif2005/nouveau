// frontend/src/features/reviews/StarRating.jsx
import React, { useState } from 'react';

// Placeholder icons - vous pouvez utiliser react-icons ou des SVGs ici
const StarIconFilled = ({ className = "w-6 h-6 text-yellow-400" }) => <span className={className}>★</span>;
const StarIconEmpty = ({ className = "w-6 h-6 text-gray-300" }) => <span className={className}>☆</span>;


const StarRating = ({ rating = 0, onRate, editable = true, starCount = 5, size = "text-2xl" }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleMouseOver = (index) => {
    if (editable) {
      setHoverRating(index);
    }
  };

  const handleMouseLeave = () => {
    if (editable) {
      setHoverRating(0);
    }
  };

  const handleClick = (index) => {
    if (editable && onRate) {
      onRate(index);
    }
  };

  const stars = [];
  for (let i = 1; i <= starCount; i++) {
    const displayRating = hoverRating || rating;
    stars.push(
      <button
        key={i}
        type="button"
        disabled={!editable}
        className={`focus:outline-none transition-colors duration-150 ${size} ${editable ? 'cursor-pointer' : 'cursor-default'}`}
        onClick={() => handleClick(i)}
        onMouseOver={() => handleMouseOver(i)}
        onMouseLeave={handleMouseLeave}
        aria-label={`Noter ${i} sur ${starCount} étoiles`}
      >
        {i <= displayRating ? <StarIconFilled /> : <StarIconEmpty />}
      </button>
    );
  }

  return <div className="flex items-center space-x-1">{stars}</div>;
};

export default StarRating;
