import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import PageContainer from '../components/layout/PageContainer';
import CheckoutStepper from '../components/checkout/CheckoutStepper';
import ShippingForm from '../components/checkout/ShippingForm';
import OrderReview from '../components/checkout/OrderReview';
import LoadingState from '../components/common/LoadingState';
import { useCart } from '../context/CartContext';
import { createOrder } from '../api/ordersApi';
import type { ShippingDetails, Order } from '../types/order.types';

export default function CheckoutPage() {
  const { cart, loading: cartLoading, clearCartState } = useCart();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);

  const handleShippingSubmit = (details: ShippingDetails) => {
    setShippingDetails(details);
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    if (!shippingDetails) return;
    setPlacing(true);
    setPlaceError(null);
    try {
      const response = await createOrder(shippingDetails);
      setPlacedOrder(response.order);
      // Backend cleared the cart — sync frontend state to match.
      clearCartState();
      setStep(3);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.error?.message;
        setPlaceError(message || 'Failed to place order. Please try again.');
      } else {
        setPlaceError('Something went wrong. Please try again.');
      }
    } finally {
      setPlacing(false);
    }
  };

  return (
    <PageContainer>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <CheckoutStepper currentStep={step} />

      {/* Cart loading / empty states only apply before confirmation */}
      {step < 3 && cartLoading ? (
        <LoadingState message="Loading your cart..." />
      ) : step < 3 && (!cart || cart.items.length === 0) ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-6">Your cart is empty. Add items before checking out.</p>
          <Link
            to="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      ) : step === 1 ? (
        <ShippingForm initialValues={shippingDetails} onSubmit={handleShippingSubmit} />
      ) : step === 2 ? (
        <OrderReview
          shippingDetails={shippingDetails!}
          placing={placing}
          placeError={placeError}
          onBack={() => setStep(1)}
          onPlaceOrder={handlePlaceOrder}
        />
      ) : (
        /* Confirmation */
        <div className="max-w-lg mx-auto text-center py-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
          <p className="text-gray-500 mb-8">
            Thank you for your purchase. Your order is being processed.
          </p>

          {placedOrder && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 text-left mb-8">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order ID</span>
                  <span className="font-semibold text-gray-900">#{placedOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="font-semibold text-gray-900 capitalize">{placedOrder.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total</span>
                  <span className="font-bold text-gray-900">
                    ${Number(placedOrder.total_amount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ship to</span>
                  <span className="font-semibold text-gray-900 text-right max-w-xs">
                    {placedOrder.shipping_city}, {placedOrder.shipping_country}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/orders"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors shadow-md"
            >
              View Orders
            </Link>
            <Link
              to="/"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-8 py-3 rounded-xl transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
