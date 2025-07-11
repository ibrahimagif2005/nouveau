// frontend/src/__tests__/CartSlice.test.js
import cartReducer, {
  addToCartAction,
  removeFromCartAction,
  updateQuantityAction,
  clearCartAction,
  selectCartItems, // Importer les sélecteurs si on veut les tester aussi
  selectCartTotalPrice,
  selectCartTotalItems
} from '../redux/slices/cartSlice'; // Ajustez le chemin

// Mocker localStorage pour les tests
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });


describe('cartSlice reducer', () => {
  const product1 = { id: '1', name: 'Produit 1', price: 10 };
  const product2 = { id: '2', name: 'Produit 2', price: 20 };

  let initialState;

  beforeEach(() => {
    // Réinitialiser localStorage et l'état initial avant chaque test
    localStorageMock.clear();
    // L'état initial sera chargé depuis le localStorage mocké (vide au début)
    initialState = { items: [] };
    // Si loadCartFromLocalStorage est exporté, on pourrait l'appeler ici pour être plus fidèle.
    // Pour l'instant, on simule son effet.
  });

  test('devrait gérer l\'état initial', () => {
    expect(cartReducer(undefined, { type: 'unknown' })).toEqual({ items: [] });
  });

  test('devrait gérer addToCartAction pour un nouveau produit', () => {
    const action = addToCartAction({ ...product1, quantity: 1 });
    const state = cartReducer(initialState, action);
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toEqual({ ...product1, quantity: 1 });
    expect(localStorageMock.setItem).toHaveBeenCalledWith('cartItems', JSON.stringify(state.items));
  });

  test('devrait gérer addToCartAction pour un produit existant (augmenter la quantité)', () => {
    // Ajouter le produit une première fois
    let state = cartReducer(initialState, addToCartAction({ ...product1, quantity: 1 }));
    // Ajouter le même produit à nouveau
    const action = addToCartAction({ ...product1, quantity: 2 }); // Ajouter 2 de plus
    state = cartReducer(state, action);

    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toEqual(3); // 1 + 2
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(2); // Appelé après chaque action
  });

  test('devrait gérer removeFromCartAction', () => {
    // État initial avec un produit
    initialState.items = [{ ...product1, quantity: 1 }];
    localStorageMock.setItem('cartItems', JSON.stringify(initialState.items)); // Simuler le localStorage

    const action = removeFromCartAction(product1.id);
    const state = cartReducer(initialState, action);

    expect(state.items).toHaveLength(0);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('cartItems', JSON.stringify([]));
  });

  test('devrait gérer updateQuantityAction', () => {
    initialState.items = [{ ...product1, quantity: 2 }];
    localStorageMock.setItem('cartItems', JSON.stringify(initialState.items));

    const action = updateQuantityAction({ productId: product1.id, quantity: 5 });
    const state = cartReducer(initialState, action);

    expect(state.items[0].quantity).toEqual(5);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('cartItems', JSON.stringify(state.items));
  });

  test('devrait retirer le produit si updateQuantityAction met la quantité à 0 ou moins', () => {
    initialState.items = [{ ...product1, quantity: 2 }];
    localStorageMock.setItem('cartItems', JSON.stringify(initialState.items));

    const action = updateQuantityAction({ productId: product1.id, quantity: 0 });
    const state = cartReducer(initialState, action);

    expect(state.items).toHaveLength(0);
  });

  test('devrait gérer clearCartAction', () => {
    initialState.items = [{ ...product1, quantity: 1 }, { ...product2, quantity: 2 }];
    localStorageMock.setItem('cartItems', JSON.stringify(initialState.items));

    const action = clearCartAction();
    const state = cartReducer(initialState, action);

    expect(state.items).toHaveLength(0);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('cartItems', JSON.stringify([]));
  });

  // Tests pour les sélecteurs (exemple)
  describe('cartSlice selectors', () => {
    const mockState = {
      cart: {
        items: [
          { ...product1, quantity: 2 }, // 2 * 10 = 20
          { ...product2, quantity: 3 }, // 3 * 20 = 60
        ],
      },
    };

    test('selectCartItems devrait retourner les items', () => {
      expect(selectCartItems(mockState)).toEqual(mockState.cart.items);
    });

    test('selectCartTotalItems devrait retourner le nombre total d\'articles', () => {
      expect(selectCartTotalItems(mockState)).toEqual(5); // 2 + 3
    });

    test('selectCartTotalPrice devrait retourner le prix total', () => {
      expect(selectCartTotalPrice(mockState)).toEqual(80); // 20 + 60
    });
  });
});
