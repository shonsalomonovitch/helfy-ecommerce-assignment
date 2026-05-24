import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import type { CartItem as CartItemType } from '../../types/cart.types';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const [busy, setBusy] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleQuantityChange = async (delta: number) => {
    setBusy(true);
    try {
      await updateQuantity(item.product_id, item.quantity + delta);
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    setBusy(true);
    try {
      await removeItem(item.product_id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-4 py-5 border-b border-gray-100 last:border-0">
      {/* Image */}
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
        {!imgError ? (
          <img
            src={item.product_image_url}
            alt={item.product_name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Name + category + unit price */}
      <div className="flex-grow min-w-0">
        <p className="font-semibold text-gray-900 truncate">{item.product_name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{item.category}</p>
        <p className="text-sm text-gray-500 mt-1">
          ${Number(item.product_price).toFixed(2)} each
        </p>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => handleQuantityChange(-1)}
          disabled={busy}
          aria-label="Decrease quantity"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          −
        </button>
        <span className="w-6 text-center font-medium text-gray-900 select-none">
          {item.quantity}
        </span>
        <button
          onClick={() => handleQuantityChange(1)}
          disabled={busy}
          aria-label="Increase quantity"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          +
        </button>
      </div>

      {/* Subtotal */}
      <div className="w-20 text-right font-semibold text-gray-900 flex-shrink-0">
        ${Number(item.subtotal).toFixed(2)}
      </div>

      {/* Remove */}
      <button
        onClick={handleRemove}
        disabled={busy}
        aria-label="Remove item"
        className="ml-1 text-gray-300 hover:text-red-400 disabled:opacity-40 transition-colors flex-shrink-0"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
