import apiClient from './apiClient';
import type { ShippingDetails, CreateOrderResponse, Order } from '../types/order.types';

export const createOrder = async (
  shippingDetails: ShippingDetails
): Promise<CreateOrderResponse> => {
  const response = await apiClient.post('/api/orders', shippingDetails);
  return response.data;
};

export const getOrders = async (): Promise<Order[]> => {
  const response = await apiClient.get('/api/orders');
  return response.data.orders;
};
