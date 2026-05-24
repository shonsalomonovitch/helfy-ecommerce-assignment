// Product type matching backend response shape
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
  created_at: string;
  updated_at: string;
}

// Product filters for API query parameters
export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
}
