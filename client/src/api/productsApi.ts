import apiClient from './apiClient';
import type { Product, ProductFilters } from '../types/product.types';

/**
 * Fetch all products with optional filters.
 * Backend returns: { products: Product[] }
 */
export const getProducts = async (filters?: ProductFilters): Promise<Product[]> => {
  try {
    // Build query params only for values that exist
    const params: Record<string, string> = {};
    
    if (filters?.search) {
      params.search = filters.search;
    }
    if (filters?.category && filters.category !== 'All') {
      params.category = filters.category;
    }
    if (filters?.minPrice) {
      params.minPrice = String(filters.minPrice);
    }
    if (filters?.maxPrice) {
      params.maxPrice = String(filters.maxPrice);
    }

    const response = await apiClient.get('/api/products', { params });
    return response.data.products;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
};

/**
 * Fetch a single product by ID.
 * Backend returns: { product: Product }
 */
export const getProductById = async (id: string | number): Promise<Product> => {
  try {
    const response = await apiClient.get(`/api/products/${id}`);
    return response.data.product;
  } catch (error) {
    console.error(`Failed to fetch product ${id}:`, error);
    throw error;
  }
};
