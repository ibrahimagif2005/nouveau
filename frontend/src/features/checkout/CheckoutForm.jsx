// frontend/src/features/checkout/CheckoutForm.jsx
import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useSelector } from 'react-redux'; // Pour obtenir l'email de l'utilisateur par exemple

const CheckoutForm = ({ order, clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSelector(state => state.auth); // Pour pré-remplir l'email si disponible

  useEffect(() => {
    if (!stripe || !clientSecret) { // clientSecret est passé en option à <Elements>
      return;
    }
    // Récupérer le PaymentIntent pour vérifier son statut si nécessaire,
    // mais Stripe Elements gère beaucoup de cela.
    // stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
    //   switch (paymentIntent.status) {
    //     case "succeeded":
    //       setMessage("Paiement réussi!");
    //       break;
    //     case "processing":
    //       setMessage("Votre paiement est en cours de traitement.");
    //       break;
    //     case "requires_payment_method":
    //       setMessage("Veuillez entrer vos informations de paiement.");
    //       break;
    //     default:
    //       setMessage("Quelque chose s'est mal passé.");
    //       break;
    //   }
    // });
  }, [stripe, clientSecret]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js n'a pas encore chargé.
      // Désactiver la soumission du formulaire jusqu'à ce que Stripe.js ait chargé.
      console.log("Stripe.js n'est pas encore chargé.");
      setMessage("Le service de paiement n'est pas prêt, veuillez patienter.");
      return;
    }

    setIsLoading(true);
    setMessage(null); // Réinitialiser les messages

    const { error, paymentIntent } = await stripe.confirmPayment({ // Utiliser confirmPayment pour le nouveau Payment Element
      elements,
      confirmParams: {
        // URL de retour où le client sera redirigé après le paiement.
        // Stripe ajoutera `payment_intent` et `payment_intent_client_secret` à cette URL.
        return_url: `${window.location.origin}/order-confirmation`, // Ou une page de statut de commande
        // Optionnel: pré-remplir l'email si disponible
        // receipt_email: user?.email || undefined,
      },
      // Si vous ne voulez pas de redirection immédiate et gérer le résultat ici:
      // redirect: 'if_required'
    });

    // Si `redirect: 'if_required'` est utilisé, le code ci-dessous sera exécuté.
    // Sinon, l'utilisateur sera redirigé vers `return_url`.
    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || "Une erreur de validation est survenue.");
      } else {
        setMessage("Une erreur inattendue est survenue lors du paiement.");
      }
      console.error("Erreur de paiement Stripe:", error);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setMessage(`Paiement réussi! ID: ${paymentIntent.id}. Redirection...`);
      // La redirection est gérée par Stripe si return_url est fourni et redirect non 'if_required'
      // Sinon, gérer la redirection ou la mise à jour de l'UI ici.
      // Par exemple, vider le panier, afficher une page de succès.
      // dispatch(clearCartAction());
      // navigate(`/order-confirmation/${order?._id || paymentIntent.id}`);
      console.log("Paiement Stripe réussi:", paymentIntent);
    } else if (paymentIntent) {
      setMessage(`Statut du paiement: ${paymentIntent.status}.`);
      console.log("Statut PaymentIntent:", paymentIntent);
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: "tabs", // ou "accordion"
    // Vous pouvez ajouter d'autres options de personnalisation ici
    // defaultValues: {
    //   billingDetails: {
    //     name: user?.name || '',
    //     email: user?.email || '',
    //     // address: { // L'adresse est généralement collectée séparément
    //     //   line1: order?.shippingAddress?.address,
    //     //   city: order?.shippingAddress?.city,
    //     //   postal_code: order?.shippingAddress?.postalCode,
    //     //   country: order?.shippingAddress?.country,
    //     // }
    //   }
    // }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Informations de Paiement</h3>
        <p className="text-sm text-gray-500 mb-4">Transaction sécurisée par Stripe.</p>
        <PaymentElement id="payment-element" options={paymentElementOptions} />
      </div>

      <button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        <span id="button-text">
          {isLoading ? (
            <div className="spinner-border animate-spin inline-block w-4 h-4 border-2 rounded-full" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          ) : (
            `Payer ${order?.totalPrice ? order.totalPrice.toFixed(2) + ' €' : ''}`
          )}
        </span>
      </button>

      {/* Afficher les messages d'erreur ou de succès ici */}
      {message && <div id="payment-message" className={`mt-4 text-sm ${message.startsWith("Paiement réussi") ? 'text-green-600' : 'text-red-600'}`}>{message}</div>}
    </form>
  );
};

export default CheckoutForm;
