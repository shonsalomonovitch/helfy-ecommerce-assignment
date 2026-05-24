import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import type { ShippingDetails } from '../../types/order.types';

interface OrderReviewProps {
  shippingDetails: ShippingDetails;
  placing: boolean;
  placeError: string | null;
  onBack: () => void;
  onPlaceOrder: () => void;
}

export default function OrderReview({
  shippingDetails,
  placing,
  placeError,
  onBack,
  onPlaceOrder,
}: OrderReviewProps) {
  const { cart } = useCart();
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  if (!cart) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Review Your Order</h2>

      {/* Cart items */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-700 mb-4">Items</h3>
        <div className="divide-y divide-gray-100">
          {cart.items.map((item) => (
            <div key={item.product_id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
              {/* Image */}
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                {!imgErrors[item.product_id] ? (
                  <img
                    src={item.product_image_url}
                    alt={item.product_name}
                    className="w-full h-full object-cover"
                    onError={() =>
                      setImgErrors((prev) => ({ ...prev, [item.product_id]: true }))
                    }
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex-grow min-w-0">
                <p className="font-medium text-gray-900 truncate">{item.product_name}</p>
                <p className="text-sm text-gray-400">
                  ${Number(item.product_price).toFixed(2)} × {item.quantity}
                </p>
              </div>

              <p className="font-semibold text-gray-900 flex-shrink-0">
                ${Number(item.subtotal).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {/* Total — from backend, not calculated on frontend */}
        <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center">
          <span className="text-base font-semibold text-gray-700">Order Total</span>
          <span className="text-xl font-bold text-gray-900">
            ${Number(cart.total).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Shipping summary */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-700 mb-3">Shipping To</h3>
        <p className="text-gray-900 font-medium">{shippingDetails.shipping_name}</p>
        <p className="text-gray-600 text-sm mt-1">{shippingDetails.shipping_address}</p>
        <p className="text-gray-600 text-sm">
          {shippingDetails.shipping_city}, {shippingDetails.shipping_country}
        </p>
      </div>

      {/* Error */}
      {placeError && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {placeError}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onBack}
          disabled={placing}
          className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          Back to Shipping
        </button>
        <button
          onClick={onPlaceOrder}
          disabled={placing}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
        >
          {placing && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {placing ? 'Placing Order…' : 'Place Order'}
        </button>
      </div>
    </div>
  );
}
