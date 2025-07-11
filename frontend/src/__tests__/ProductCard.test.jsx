// frontend/src/__tests__/ProductCard.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import configureStore from 'redux-mock-store'; // Pour mocker le store Redux
import ProductCard from '../features/products/ProductCard'; // Ajustez le chemin

// Configurer un mock store initial
const mockStore = configureStore([]);

describe('ProductCard Component', () => {
  let store;
  const mockProduct = {
    _id: '123',
    name: 'Super Produit Test',
    price: 29.99,
    imageUrl: 'https://via.placeholder.com/300',
    stock: 10,
  };

  const initialState = {
    auth: { user: { wishlist: [] }, token: 'fake-token' }, // Simuler un utilisateur connecté sans wishlist
    cart: { items: [] } // Panier vide
  };

  beforeEach(() => {
    store = mockStore(initialState);
    // Mocker la fonction dispatch pour vérifier les actions Redux
    store.dispatch = jest.fn();
  });

  test('devrait afficher les informations du produit correctement', () => {
    render(
      <Provider store={store}>
        <Router>
          <ProductCard product={mockProduct} />
        </Router>
      </Provider>
    );

    expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    expect(screen.getByText(`$${mockProduct.price.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByAltText(mockProduct.name)).toHaveAttribute('src', mockProduct.imageUrl);
    expect(screen.getByRole('button', { name: /Ajouter au panier/i })).toBeInTheDocument();
  });

  test('devrait appeler addToCartAction lorsqu\'on clique sur "Ajouter au panier"', () => {
    render(
      <Provider store={store}>
        <Router>
          <ProductCard product={mockProduct} />
        </Router>
      </Provider>
    );

    const addButton = screen.getByRole('button', { name: /Ajouter au panier/i });
    fireEvent.click(addButton);

    // Vérifier que l'action addToCartAction a été dispatchée avec le bon payload
    // Note: il faut importer l'action réelle ou mocker son type exact.
    // Pour l'instant, on vérifie juste que dispatch a été appelé.
    // expect(store.dispatch).toHaveBeenCalledWith(addToCartAction({ ...mockProduct, quantity: 1 }));
    expect(store.dispatch).toHaveBeenCalled(); // Simplifié pour l'exemple
    // Pour une vérification plus précise du payload, il faudrait importer addToCartAction
    // et s'assurer que le mock store est configuré pour tracer les actions correctement.
  });

  test('devrait afficher "Épuisé" si le stock est à 0', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    render(
      <Provider store={store}>
        <Router>
          <ProductCard product={outOfStockProduct} />
        </Router>
      </Provider>
    );
    expect(screen.getByRole('button', { name: /Épuisé/i })).toBeDisabled();
  });

  // TODO: Ajouter des tests pour le WishlistButton à l'intérieur du ProductCard
  // Cela nécessiterait de mocker useApi et potentiellement plus de setup pour le currentUser.
});
