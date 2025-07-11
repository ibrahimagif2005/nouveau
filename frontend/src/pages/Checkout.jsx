// frontend/src/pages/Checkout.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '../features/checkout/CheckoutForm'; // Le formulaire Stripe Elements
import useApi from '../hooks/useApi'; // Pour créer la commande et l'intention de paiement
import { selectCartItems, selectCartTotalPrice } from '../redux/slices/cartSlice';
import { selectCurrentUser } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';

// Charger Stripe.js en dehors du rendu du composant pour éviter de le recharger à chaque render.
// Assurez-vous que REACT_APP_STRIPE_PUBLISHABLE_KEY est dans votre .env pour le frontend
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY');

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { fetchData, isLoading: apiIsLoading, error: apiError } = useApi();

  const cartItems = useSelector(selectCartItems);
  const cartTotalPrice = useSelector(selectCartTotalPrice); // Total des items, le backend recalculera
  const currentUser = useSelector(selectCurrentUser);

  const [clientSecret, setClientSecret] = useState('');
  const [currentOrder, setCurrentOrder] = useState(null);
  const [formSubmitError, setFormSubmitError] = useState('');
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  // Rediriger si le panier est vide
  useEffect(() => {
    if (!apiIsLoading && cartItems.length === 0 && !currentOrder) {
      navigate('/'); // ou vers la page du panier
    }
  }, [cartItems, navigate, currentOrder, apiIsLoading]);

  // Handler pour la soumission du formulaire d'adresse
  const onAddressSubmit = async (data) => {
    if (cartItems.length === 0) {
      setFormSubmitError("Votre panier est vide.");
      return;
    }
    setIsProcessingOrder(true);
    setFormSubmitError('');

    const orderPayload = {
      orderItems: cartItems.map(item => ({
        product: item.id || item._id, // S'assurer d'envoyer l'ID correct
        quantity: item.quantity,
        // Le prix sera vérifié/utilisé côté serveur
      })),
      shippingAddress: {
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country,
      },
      // Le backend calculera les prix (itemsPrice, taxPrice, shippingPrice, totalPrice)
    };

    try {
      // Étape 1: Créer la commande et l'intention de paiement côté backend
      const response = await fetchData('/orders', 'POST', orderPayload); // L'endpoint pour créer la commande
      if (response.success && response.clientSecret && response.order) {
        setClientSecret(response.clientSecret);
        setCurrentOrder(response.order); // Sauvegarder la commande créée
      } else {
        throw new Error(response.message || "Erreur lors de la création de la commande.");
      }
    } catch (err) {
      console.error("Erreur lors de la création de la commande/intention de paiement:", err);
      setFormSubmitError(err.message || "Une erreur est survenue lors de la préparation de votre commande.");
    } finally {
      setIsProcessingOrder(false);
    }
  };

  if (cartItems.length === 0 && !clientSecret && !isProcessingOrder) { // Ajout de !isProcessingOrder pour éviter flash
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-semibold mb-4">Votre panier est vide</h1>
        <p className="mb-4">Ajoutez des produits à votre panier avant de passer à la caisse.</p>
        <button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Continuer les achats
        </button>
      </div>
    );
  }

  // Options pour Stripe Elements (clientSecret est nécessaire ici)
  const stripeElementsOptions = clientSecret ? { clientSecret, appearance: { theme: 'stripe' } } : null;

  return (
    <div className="container mx-auto p-4 mt-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Passer la Commande</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Colonne 1: Formulaire d'adresse (si clientSecret n'est pas encore défini) ou Récapitulatif */}
        <div className="md:col-span-2">
          {!clientSecret ? (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-6">1. Informations de Livraison</h2>
              <form onSubmit={handleSubmit(onAddressSubmit)}>
                {/* Champs d'adresse */}
                <div className="mb-4">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <input type="text" id="address" {...register('address', { required: 'Adresse requise' })} defaultValue={currentUser?.address || ''} className={`w-full p-2 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-blue-500 focus:border-blue-500`} />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                </div>
                <div className="mb-4">
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                  <input type="text" id="city" {...register('city', { required: 'Ville requise' })} defaultValue={currentUser?.shippingAddress?.city || ''} className={`w-full p-2 border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-blue-500 focus:border-blue-500`} />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">Code Postal</label>
                    <input type="text" id="postalCode" {...register('postalCode', { required: 'Code postal requis' })} defaultValue={currentUser?.shippingAddress?.postalCode || ''} className={`w-full p-2 border ${errors.postalCode ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-blue-500 focus:border-blue-500`} />
                    {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                    <input type="text" id="country" {...register('country', { required: 'Pays requis' })} defaultValue={currentUser?.shippingAddress?.country || ''} className={`w-full p-2 border ${errors.country ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-blue-500 focus:border-blue-500`} />
                    {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
                  </div>
                </div>
                {formSubmitError && <p className="text-red-500 text-sm mb-4">{formSubmitError}</p>}
                {(apiIsLoading || isProcessingOrder) && <p className="text-blue-600 text-sm mb-4">Préparation de votre commande...</p>}
                <button
                  type="submit"
                  disabled={apiIsLoading || isProcessingOrder}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:opacity-50"
                >
                  {(apiIsLoading || isProcessingOrder) ? 'Veuillez patienter...' : 'Valider et Passer au Paiement'}
                </button>
              </form>
            </div>
          ) : (
            // Une fois clientSecret obtenu, afficher le formulaire de paiement Stripe
            stripeElementsOptions && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-6">2. Paiement Sécurisé</h2>
                <Elements stripe={stripePromise} options={stripeElementsOptions}>
                  <CheckoutForm order={currentOrder} clientSecret={clientSecret} />
                </Elements>
              </div>
            )
          )}
          {(apiError && !clientSecret) && <p className="text-red-500 text-sm mt-4">Erreur API: {apiError.message}</p>}
        </div>

        {/* Colonne 2: Récapitulatif de la Commande */}
        <div className="md:col-span-1 bg-gray-50 p-6 rounded-lg shadow-md h-fit">
          <h2 className="text-2xl font-semibold mb-6">Récapitulatif</h2>
          {cartItems.map(item => (
            <div key={item.id || item._id} className="flex justify-between items-center py-2 border-b last:border-b-0">
              <div>
                <p className="font-medium text-sm">{item.name} (x{item.quantity})</p>
                <p className="text-xs text-gray-600">${item.price?.toFixed(2)}</p>
              </div>
              <p className="font-medium text-sm">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between mb-1">
              <p className="text-sm">Sous-total (articles):</p>
              <p className="text-sm">${cartTotalPrice.toFixed(2)}</p>
            </div>
            {/* Les taxes et frais de port seront affichés une fois la commande créée et le total final connu */}
            {currentOrder ? (
              <>
                <div className="flex justify-between mb-1">
                  <p className="text-sm">Livraison:</p>
                  <p className="text-sm">${currentOrder.shippingPrice.toFixed(2)}</p>
                </div>
                <div className="flex justify-between mb-3">
                  <p className="text-sm">Taxes:</p>
                  <p className="text-sm">${currentOrder.taxPrice.toFixed(2)}</p>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <p>Total à Payer:</p>
                  <p>${currentOrder.totalPrice.toFixed(2)}</p>
                </div>
              </>
            ) : (
                <p className="text-sm text-gray-500 mt-2">Les frais de livraison et taxes seront calculés à l'étape suivante.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
