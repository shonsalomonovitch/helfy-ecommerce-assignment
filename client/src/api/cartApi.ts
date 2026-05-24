import apiClient from './apiClient';
import type { Cart } from '../types/cart.types';

export const getCart = async (): Promise<Cart> => {
  const response = await apiClient.get('/api/cart');
  return response.data.cart;
};

// POST /api/cart/items only returns the new cart_item, not the full cart.
// Re-fetch after mutation so CartContext always gets a complete Cart.
export const addToCart = async (productId: number, quantity = 1): Promise<Cart> => {
  await apiClient.post('/api/cart/items', { product_id: productId, quantity });
  return getCart();
};

export const updateCartItem = async (productId: number, quantity: number): Promise<Cart> => {
  await apiClient.put(`/api/cart/items/${productId}`, { quantity });
  return getCart();
};

export const removeCartItem = async (productId: number): Promise<Cart> => {
  await apiClient.delete(`/api/cart/items/${productId}`);
  return getCart();
};
