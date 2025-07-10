// frontend/src/components/CartModal.jsx
import React from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { removeFromCartAction, updateQuantityAction } from '../redux/slices/cartSlice';
// import { FaTimes, FaPlus, FaMinus, FaTrash } from 'react-icons/fa';

const CartModal = ({ isOpen, onClose }) => {
  // const cartItems = useSelector(state => state.cart.items);
  // const dispatch = useDispatch();

  // const handleRemoveFromCart = (productId) => {
  //   dispatch(removeFromCartAction(productId));
  // };

  // const handleUpdateQuantity = (productId, quantity) => {
  //   if (quantity < 1) {
  //     dispatch(removeFromCartAction(productId));
  //   } else {
  //     dispatch(updateQuantityAction({ productId, quantity }));
  //   }
  // };

  // const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (!isOpen) return null;

  const cartItems = [ // Données placeholder
    { id: 1, name: 'Produit Exemple 1', quantity: 2, price: 10, imageUrl: 'https://via.placeholder.com/50' },
    { id: 2, name: 'Produit Exemple 2', quantity: 1, price: 25, imageUrl: 'https://via.placeholder.com/50' },
  ];
  const totalPrice = 45.00;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Votre Panier</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            {/* <FaTimes size={24} /> */}
            Fermer (X)
          </button>
        </div>

        {cartItems.length === 0 ? (
          <p className="text-center text-gray-600">Votre panier est vide.</p>
        ) : (
          <div className="overflow-y-auto flex-grow">
            {cartItems.map(item => (
              <div key={item.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded mr-4" />
                <div className="flex-grow">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center">
                  {/* <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} className="p-1 text-gray-600 hover:text-black">
                    <FaMinus />
                  </button> */}
                  <span className="mx-2">{item.quantity}</span>
                  {/* <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} className="p-1 text-gray-600 hover:text-black">
                    <FaPlus />
                  </button> */}
                  {/* <button onClick={() => handleRemoveFromCart(item.id)} className="ml-4 text-red-500 hover:text-red-700">
                    <FaTrash />
                  </button> */}
                   <span className="mx-1">Q:</span>
                   <button className="p-1 text-gray-600 hover:text-black">(-)</button>
                   <button className="p-1 text-gray-600 hover:text-black">(+)</button>
                   <button className="ml-2 text-red-500 hover:text-red-700">(Suppr)</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {cartItems.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center font-semibold text-lg mb-4">
              <span>Total:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <button
              // onClick={() => { onClose(); /* navigate to checkout */ }}
              className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Passer à la caisse
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
