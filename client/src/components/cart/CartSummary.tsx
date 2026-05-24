import { Link } from 'react-router-dom';
import type { Cart } from '../../types/cart.types';

interface CartSummaryProps {
  cart: Cart;
}

export default function CartSummary({ cart }: CartSummaryProps) {
  const isEmpty = cart.items.length === 0;
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sticky top-8">
      <h2 className="text-xl font-bold text-gray-900 mb-5">Order Summary</h2>

      <div className="space-y-3 mb-5 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Items ({itemCount})</span>
          <span>${Number(cart.total).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span className="text-green-600 font-medium">Free</span>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4 mb-6">
        <div className="flex justify-between text-lg font-bold text-gray-900">
          <span>Total</span>
          <span>${Number(cart.total).toFixed(2)}</span>
        </div>
      </div>

      <Link
        to="/checkout"
        aria-disabled={isEmpty}
        tabIndex={isEmpty ? -1 : 0}
        className={`block w-full text-center font-semibold py-3.5 rounded-xl transition-colors ${
          isEmpty
            ? 'bg-gray-100 text-gray-400 pointer-events-none'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
        }`}
      >
        Proceed to Checkout
      </Link>

      <Link
        to="/"
        className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium mt-4 transition-colors"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
