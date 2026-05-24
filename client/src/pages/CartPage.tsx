import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import { useCart } from '../context/CartContext';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';

export default function CartPage() {
  const { cart, loading, error, refreshCart } = useCart();
  const navigate = useNavigate();

  return (
    <PageContainer>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      {loading ? (
        <LoadingState message="Loading your cart..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refreshCart} />
      ) : !cart || cart.items.length === 0 ? (
        <EmptyState
          message="Your cart is empty."
          actionLabel="Browse Products"
          onAction={() => navigate('/')}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Items */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            {cart.items.map((item) => (
              <CartItem key={item.product_id} item={item} />
            ))}
          </div>

          {/* Summary */}
          <CartSummary cart={cart} />
        </div>
      )}
    </PageContainer>
  );
}
