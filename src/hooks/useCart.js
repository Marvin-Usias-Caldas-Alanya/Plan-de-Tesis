import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  getCartItems,
  getOrCreateActiveCart,
  removeCartItem,
  updateCartItemQuantity,
  upsertCartItem,
} from '../services/cartService';
import { useAuth } from './useAuth';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const profileId = user?.id ?? null;

  const [cartId, setCartId] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!profileId) {
      setCartId(null);
      setItems([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const cart = await getOrCreateActiveCart(profileId);
      setCartId(cart.id);
      const rows = await getCartItems(cart.id);
      setItems(rows);
    } catch (err) {
      setError(err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addProduct = useCallback(
    async (product, quantity = 1) => {
      if (!profileId) {
        throw new Error('Debes iniciar sesión para agregar al carrito');
      }
      if (product.stock <= 0) {
        throw new Error('Producto agotado');
      }

      setSubmitting(true);
      setError(null);
      try {
        let activeCartId = cartId;
        if (!activeCartId) {
          const cart = await getOrCreateActiveCart(profileId);
          activeCartId = cart.id;
          setCartId(activeCartId);
        }
        await upsertCartItem(activeCartId, { productId: product.id, quantity });
        await refresh();
        return true;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [profileId, cartId, refresh],
  );

  const setQuantity = useCallback(
    async (cartItemId, quantity) => {
      setSubmitting(true);
      setError(null);
      try {
        await updateCartItemQuantity(cartItemId, quantity);
        await refresh();
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [refresh],
  );

  const removeItem = useCallback(
    async (cartItemId) => {
      setSubmitting(true);
      setError(null);
      try {
        await removeCartItem(cartItemId);
        await refresh();
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [refresh],
  );

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      cartId,
      items,
      itemCount,
      subtotal,
      loading,
      submitting,
      error,
      refresh,
      addProduct,
      setQuantity,
      removeItem,
    }),
    [
      cartId,
      items,
      itemCount,
      subtotal,
      loading,
      submitting,
      error,
      refresh,
      addProduct,
      setQuantity,
      removeItem,
    ],
  );

  return createElement(CartContext.Provider, { value }, children);
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
}
