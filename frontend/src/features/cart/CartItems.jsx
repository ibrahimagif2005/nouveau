// frontend/src/features/cart/CartItems.jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCartAction, updateQuantityAction } from '../../redux/slices/cartSlice';
// import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa';

const CartItems = () => {
  const cartItems = useSelector(state => state.cart.items);
  const dispatch = useDispatch();

  const handleRemoveFromCart = (productId) => {
    dispatch(removeFromCartAction(productId));
  };

  const handleUpdateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      // Optionnel: confirmer la suppression si la quantité devient 0
      // ou simplement retirer comme le fait déjà le slice
      dispatch(removeFromCartAction(productId));
    } else {
      dispatch(updateQuantityAction({ productId, quantity }));
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return <p className="text-center text-gray-600 my-4">Votre panier est vide.</p>;
  }

  return (
    <div className="overflow-y-auto flex-grow">
      {cartItems.map(item => (
        <div key={item.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
          <img
            src={item.imageUrl || 'https://via.placeholder.com/64'}
            alt={item.name}
            className="w-16 h-16 object-cover rounded mr-4"
          />
          <div className="flex-grow">
            <h3 className="font-semibold text-sm md:text-base">{item.name}</h3>
            <p className="text-xs md:text-sm text-gray-500">${item.price ? item.price.toFixed(2) : 'N/A'}</p>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
              className="p-1 text-gray-600 hover:text-black disabled:opacity-50"
              aria-label="Réduire la quantité"
              disabled={item.quantity <= 0} // Désactiver si 0 pour éviter négatif avant suppression
            >
              {/* <FaMinus /> */} -
            </button>
            <span className="mx-2 w-8 text-center">{item.quantity}</span>
            <button
              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
              className="p-1 text-gray-600 hover:text-black"
              aria-label="Augmenter la quantité"
            >
              {/* <FaPlus /> */} +
            </button>
            <button
              onClick={() => handleRemoveFromCart(item.id)}
              className="ml-3 md:ml-4 text-red-500 hover:text-red-700"
              aria-label="Supprimer l'article"
            >
              {/* <FaTrash /> */} Suppr.
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CartItems;
