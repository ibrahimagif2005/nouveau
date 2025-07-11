// frontend/src/features/profile/OrderHistory.jsx
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const OrderHistory = ({ orders, isLoading, error }) => {
  if (isLoading) {
    return <p>Chargement de l'historique des commandes...</p>;
  }

  if (error) {
    return <p className="text-red-500">Erreur lors du chargement des commandes: {error.message || error}</p>;
  }

  if (!orders || orders.length === 0) {
    return <p>Vous n'avez pas encore passé de commandes.</p>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">Historique des Commandes</h3>
      {orders.map(order => (
        <div key={order._id} className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex flex-wrap justify-between items-center mb-3 pb-3 border-b">
            <div>
              <p className="text-sm text-gray-600">Commande N°: <span className="font-medium text-gray-800">{order._id}</span></p>
              <p className="text-sm text-gray-500">
                Date: {format(new Date(order.createdAt), 'd MMMM yyyy, HH:mm', { locale: fr })}
              </p>
            </div>
            <div className="text-right mt-2 sm:mt-0">
              <p className="text-sm text-gray-600">Total: <span className="font-bold text-lg text-blue-600">{order.totalPrice.toFixed(2)} €</span></p>
              <p className={`text-xs font-semibold px-2 py-1 rounded-full inline-block mt-1
                ${order.status === 'Livrée' ? 'bg-green-100 text-green-700' :
                  order.status === 'Expédiée' ? 'bg-blue-100 text-blue-700' :
                  order.status === 'En cours de traitement' || order.status === 'Payée' ? 'bg-yellow-100 text-yellow-700' :
                  order.status === 'Annulée' || order.status === 'Paiement échoué' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'}`}>
                {order.status}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {order.orderItems.map(item => (
              <div key={item.product?._id || item._id || item.name} className="flex items-center space-x-3">
                <img
                  src={item.imageUrl || 'https://via.placeholder.com/64'}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-md border"
                />
                <div className="flex-grow">
                  <Link to={`/products/${item.product?._id || item.product}`} className="font-medium text-gray-800 hover:text-blue-600 text-sm">
                    {item.name}
                  </Link>
                  <p className="text-xs text-gray-500">Quantité: {item.quantity}</p>
                  <p className="text-xs text-gray-500">Prix: {item.price.toFixed(2)} €</p>
                </div>
                <p className="text-sm font-medium text-gray-700">{(item.price * item.quantity).toFixed(2)} €</p>
              </div>
            ))}
          </div>

          {/* Optionnel: lien vers la page de détail de la commande */}
          {/* <div className="mt-4 text-right">
            <Link to={`/order/${order._id}`} className="text-sm text-blue-600 hover:underline">
              Voir les détails de la commande
            </Link>
          </div> */}
        </div>
      ))}
      {/* TODO: Pagination pour l'historique des commandes */}
    </div>
  );
};

export default OrderHistory;
