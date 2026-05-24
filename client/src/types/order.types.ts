export interface ShippingDetails {
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_country: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
}

export interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  status: string;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_country: string;
  created_at: string;
  // Present on GET /api/orders; absent on POST /api/orders response.
  items?: OrderItem[];
}

export interface CreateOrderResponse {
  message: string;
  order: Order;
}
