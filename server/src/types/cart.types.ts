export interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  product_image_url: string;
  category: string;
  stock: number;
  quantity: number;
  subtotal: number;
}

export interface CartResponse {
  cart: {
    items: CartItem[];
    total: number;
  };
}

export interface AddCartItemRequestBody {
  product_id: number;
  quantity: number;
}

export interface UpdateCartItemRequestBody {
  quantity: number;
}
