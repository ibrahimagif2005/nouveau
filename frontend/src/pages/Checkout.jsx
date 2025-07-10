// frontend/src/pages/Checkout.jsx
import React from 'react';
// import { useSelector } from 'react-redux';
// import { useForm } from 'react-hook-form'; // Pour la validation du formulaire
// import api from '../services/api'; // Pour soumettre la commande

const CheckoutPage = () => {
  // const cart = useSelector(state => state.cart); // Accéder à l'état du panier
  // const { register, handleSubmit, formState: { errors } } = useForm();

  // Données placeholder pour le panier
  const cart = {
    items: [
      { id: 1, name: 'Produit Exemple 1', quantity: 2, price: 10, imageUrl: 'https://via.placeholder.com/50' },
      { id: 2, name: 'Produit Exemple 2', quantity: 1, price: 25, imageUrl: 'https://via.placeholder.com/50' },
    ],
    // Simuler les totaux calculés
    itemsPrice: 45.00,
    shippingPrice: 5.00,
    taxPrice: 4.50,
    totalPrice: 54.50,
  };

  const { items, itemsPrice, shippingPrice, taxPrice, totalPrice } = cart;

  const onSubmit = async (data) => {
    console.log('Données du formulaire de paiement (placeholder):', data);
    const orderData = {
      orderItems: items.map(item => ({ product: item.id, name: item.name, quantity: item.quantity, price: item.price, imageUrl: item.imageUrl })),
      shippingAddress: {
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country,
      },
      paymentMethod: data.paymentMethod || 'Stripe', // Ou une autre méthode
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    };
    console.log('Données de la commande à envoyer (placeholder):', orderData);
    // try {
    //   const response = await api.post('/orders', orderData);
    //   console.log('Commande créée:', response.data);
    //   // Rediriger vers une page de confirmation ou vider le panier
    // } catch (error) {
    //   console.error('Erreur lors de la création de la commande:', error);
    //   // Afficher un message d'erreur à l'utilisateur
    // }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-semibold mb-4">Votre panier est vide</h1>
        <p>Ajoutez des produits à votre panier avant de passer à la caisse.</p>
        {/* Link to products page */}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 mt-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Passer la Commande</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Section Informations de Livraison et Paiement */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6">Informations de Livraison</h2>
          {/* <form onSubmit={handleSubmit(onSubmit)}> */}
          <form onSubmit={(e) => { e.preventDefault(); const formData = new FormData(e.target); const data = Object.fromEntries(formData.entries()); onSubmit(data); }}>
            {/* Adresse */}
            <div className="mb-4">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <input type="text" id="address" name="address" /* {...register('address', { required: 'Adresse requise' })} */ className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
              {/* {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>} */}
            </div>

            {/* Ville */}
            <div className="mb-4">
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
              <input type="text" id="city" name="city" /* {...register('city', { required: 'Ville requise' })} */ className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
              {/* {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>} */}
            </div>

            {/* Code Postal et Pays */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">Code Postal</label>
                <input type="text" id="postalCode" name="postalCode" /* {...register('postalCode', { required: 'Code postal requis' })} */ className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                {/* {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>} */}
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                <input type="text" id="country" name="country" /* {...register('country', { required: 'Pays requis' })} */ className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                {/* {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>} */}
              </div>
            </div>

            <h2 className="text-2xl font-semibold mb-6 mt-8">Méthode de Paiement</h2>
            <div className="mb-4">
              {/* Ici, vous intégreriez Stripe Elements ou une autre solution de paiement */}
              <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
                <p className="text-gray-700">Intégration du paiement (ex: Stripe Elements) ici.</p>
                <p className="text-sm text-gray-500">Pour l'instant, ceci est un placeholder.</p>
              </div>
            </div>
             <input type="hidden" name="paymentMethod" value="Stripe" />


            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors"
            >
              Confirmer et Payer ${totalPrice.toFixed(2)}
            </button>
          </form>
        </div>

        {/* Section Récapitulatif de la Commande */}
        <div className="md:col-span-1 bg-gray-50 p-6 rounded-lg shadow-md h-fit">
          <h2 className="text-2xl font-semibold mb-6">Récapitulatif</h2>
          {items.map(item => (
            <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
              <div>
                <p className="font-medium">{item.name} (x{item.quantity})</p>
                <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
              </div>
              <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between mb-1">
              <p>Sous-total:</p>
              <p>${itemsPrice.toFixed(2)}</p>
            </div>
            <div className="flex justify-between mb-1">
              <p>Livraison:</p>
              <p>${shippingPrice.toFixed(2)}</p>
            </div>
            <div className="flex justify-between mb-3">
              <p>Taxes:</p>
              <p>${taxPrice.toFixed(2)}</p>
            </div>
            <div className="flex justify-between font-bold text-xl">
              <p>Total:</p>
              <p>${totalPrice.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
