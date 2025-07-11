// frontend/src/pages/OrderConfirmationPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import useApi from '../hooks/useApi';
import { useDispatch } from 'react-redux';
import { clearCartAction } from '../redux/slices/cartSlice'; // Pour vider le panier après confirmation

// Placeholder pour une animation SVG de coche
const CheckmarkAnimation = () => (
  <svg className="w-16 h-16 sm:w-24 sm:h-24 text-green-500 mx-auto mb-6" viewBox="0 0 52 52">
    <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" stroke="#4CAF50" strokeWidth="3"/>
    <path className="checkmark__check" fill="none" stroke="#4CAF50" strokeWidth="4" strokeLinecap="round" d="M14 27l10 10l18-18"/>
    {/* Ajouter une animation CSS si souhaité pour le tracé de la coche */}
    <style jsx>{`
      .checkmark__circle {
        stroke-dasharray: 166;
        stroke-dashoffset: 166;
        animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
      }
      .checkmark__check {
        transform-origin: 50% 50%;
        stroke-dasharray: 48;
        stroke-dashoffset: 48;
        animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.4s forwards;
      }
      @keyframes stroke {
        100% {
          stroke-dashoffset: 0;
        }
      }
    `}</style>
  </svg>
);

// Placeholder pour le résumé de la commande
const OrderSummary = ({ order }) => {
  if (!order) return <p>Chargement du résumé de la commande...</p>;
  return (
    <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow my-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Résumé de votre commande</h2>
      <div className="space-y-2 text-sm">
        <p><strong>Numéro de commande :</strong> {order._id}</p>
        <p><strong>Date :</strong> {new Date(order.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p><strong>Total payé :</strong> {order.totalPrice.toFixed(2)} €</p>
        <p><strong>Statut :</strong> <span className="font-medium text-green-600">{order.status}</span></p>
        <div className="pt-2">
          <h4 className="font-medium mb-1">Articles :</h4>
          <ul className="list-disc list-inside pl-2">
            {order.orderItems.map(item => (
              <li key={item.product?._id || item.name}>{item.name} (x{item.quantity})</li>
            ))}
          </ul>
        </div>
        <div className="pt-2">
            <h4 className="font-medium mb-1">Adresse de livraison :</h4>
            <p>{order.shippingAddress.address}, {order.shippingAddress.postalCode} {order.shippingAddress.city}, {order.shippingAddress.country}</p>
        </div>
      </div>
      <p className="mt-4 text-xs text-gray-600">Un email de confirmation vous a été envoyé (ou sera envoyé sous peu).</p>
    </div>
  );
};

// Placeholder pour un bouton d'envoi de reçu par email
const EmailReceiptButton = ({ order }) => {
  const handleSendReceipt = () => {
    alert(`Fonctionnalité "Envoyer le reçu par email" pour la commande ${order?._id} non implémentée.`);
    // TODO: Appeler une API pour (re)envoyer l'email de confirmation/reçu
  };
  if (!order) return null;
  return (
    <button
      onClick={handleSendReceipt}
      className="mt-4 text-sm text-blue-600 hover:underline focus:outline-none"
    >
      Recevoir une copie du reçu par email
    </button>
  );
};


const OrderConfirmationPage = () => {
  const { orderIdFromPath } = useParams(); // Si l'ID est dans le chemin de l'URL
  const location = useLocation();
  const dispatch = useDispatch();
  const { fetchData, data: order, isLoading, error } = useApi();

  const [orderId, setOrderId] = useState(orderIdFromPath);

  useEffect(() => {
    // Tenter de récupérer l'orderId depuis les query params de Stripe (payment_intent ou custom param)
    // ou depuis les paramètres de la route si Stripe redirige avec l'ID dans le chemin.
    const queryParams = new URLSearchParams(location.search);
    const stripePaymentIntentId = queryParams.get('payment_intent');
    const customOrderId = queryParams.get('order_id'); // Si on a passé notre propre order_id à Stripe et qu'il le retourne

    let finalOrderId = orderIdFromPath;
    if (customOrderId) {
        finalOrderId = customOrderId;
    }
    // Si Stripe ne retourne que le payment_intent_id, il faudrait une API backend
    // pour retrouver notre orderId à partir du payment_intent_id.
    // Pour l'instant, on suppose que l'orderId est soit dans le path, soit dans customOrderId.

    if (!finalOrderId && stripePaymentIntentId) {
        // Cas où il faut mapper paymentIntentId à orderId via le backend (non implémenté)
        console.warn("payment_intent ID reçu, mais la logique pour le mapper à un orderId interne n'est pas implémentée. Utilisation de orderIdFromPath si disponible.");
    }

    if (finalOrderId && finalOrderId !== orderId) {
      setOrderId(finalOrderId);
    }

    if (finalOrderId) {
      fetchData(`/orders/${finalOrderId}`); // Endpoint pour récupérer une commande par son ID
      dispatch(clearCartAction()); // Vider le panier après une commande réussie
    } else if (!orderIdFromPath) { // Si aucun ID n'est trouvé ni dans le path ni dans les query params
        console.error("Aucun ID de commande trouvé pour la page de confirmation.");
        // Gérer l'erreur, peut-être rediriger ou afficher un message.
    }
  }, [orderIdFromPath, location.search, fetchData, dispatch, orderId]); // Ajouter orderId aux dépendances

  if (isLoading) {
    return <div className="container mx-auto p-6 text-center">Chargement de la confirmation de commande...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-6 text-center text-red-500">Erreur: {error.message || "Impossible de charger les détails de la commande."}</div>;
  }

  if (!order && !isLoading) { // Si pas de commande et pas en chargement (ex: ID invalide ou erreur silencieuse)
    return (
        <div className="container mx-auto p-6 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Confirmation de Commande Introuvable</h1>
            <p className="text-gray-700 mb-6">Nous n'avons pas pu trouver les détails pour cette commande. Veuillez vérifier le lien ou contacter le support.</p>
            <Link to="/" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Retour à l'accueil
            </Link>
        </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-8 my-8 sm:my-12 text-center">
      <CheckmarkAnimation />
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
        Merci, votre commande a été confirmée !
      </h1>
      <p className="text-gray-600 mb-6 text-sm sm:text-base">
        Nous vous remercions pour votre achat. Votre commande est en cours de préparation.
      </p>

      {order && <OrderSummary order={order.data} />} {/* Supposant que les données sont dans order.data */}

      {order && <EmailReceiptButton order={order.data} />}

      <div className="mt-8">
        <Link
          to="/"
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
        >
          Continuer les achats
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
