import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import * as cartApi from '../api/cartApi';
import type { Cart, CartContextValue } from '../types/cart.types';

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearCartState = useCallback(() => {
    setCart(null);
    setError(null);
  }, []);

  const refreshCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await cartApi.getCart();
      setCart(data);
    } catch {
      setError('Failed to load cart. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Once the auth check resolves, load the cart if authenticated or clear if not.
  // authLoading guard prevents a double-fetch on app boot.
  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated) {
      refreshCart();
    } else {
      clearCartState();
    }
  }, [isAuthenticated, authLoading, refreshCart, clearCartState]);

  const addToCart = useCallback(async (productId: number, quantity = 1) => {
    const updatedCart = await cartApi.addToCart(productId, quantity);
    setCart(updatedCart);
  }, []);

  // quantity <= 0 means the user decremented past 1 — treat as remove.
  const updateQuantity = useCallback(async (productId: number, quantity: number) => {
    if (quantity <= 0) {
      const updatedCart = await cartApi.removeCartItem(productId);
      setCart(updatedCart);
    } else {
      const updatedCart = await cartApi.updateCartItem(productId, quantity);
      setCart(updatedCart);
    }
  }, []);

  const removeItem = useCallback(async (productId: number) => {
    const updatedCart = await cartApi.removeCartItem(productId);
    setCart(updatedCart);
  }, []);

  const itemCount =
    cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const value: CartContextValue = {
    cart,
    loading,
    error,
    itemCount,
    refreshCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCartState,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside <CartProvider>');
  }
  return context;
}
