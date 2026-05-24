export interface CreateOrderRequestBody {
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_country: string;
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
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
}

export interface OrderWithItems extends Omit<Order, 'user_id'> {
  items: OrderItem[];
}

export interface CheckoutCartItem {
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
}
