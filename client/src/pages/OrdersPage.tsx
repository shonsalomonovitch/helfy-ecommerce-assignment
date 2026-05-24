import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { getOrders } from '../api/ordersApi';
import type { Order } from '../types/order.types';

const STATUS_STYLES: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped:    'bg-purple-100 text-purple-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
};

function statusClass(status: string): string {
  return STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600';
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch {
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <PageContainer>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Order History</h1>

      {loading ? (
        <LoadingState message="Loading your orders..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchOrders} />
      ) : orders.length === 0 ? (
        <EmptyState
          message="You haven't placed any orders yet."
          actionLabel="Start Shopping"
          onAction={() => navigate('/')}
        />
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
            >
              {/* Order header */}
              <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Order</p>
                    <p className="font-bold text-gray-900">#{order.id}</p>
                  </div>
                  <div className="hidden sm:block w-px h-8 bg-gray-200" />
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(order.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusClass(order.status)}`}
                  >
                    {order.status}
                  </span>
                  <p className="text-lg font-bold text-gray-900">
                    ${Number(order.total_amount).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Order items */}
              {order.items && order.items.length > 0 && (
                <div className="px-6 py-4 divide-y divide-gray-50">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0 flex-grow">
                        <p className="font-medium text-gray-900 truncate">{item.product_name}</p>
                        <p className="text-sm text-gray-400 mt-0.5">
                          ${Number(item.product_price).toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900 flex-shrink-0 ml-4">
                        ${(Number(item.product_price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Shipping footer */}
              <div className="px-6 py-4 bg-gray-50/60 border-t border-gray-100 text-sm text-gray-500">
                <span className="font-medium text-gray-700">Ship to: </span>
                {order.shipping_name} — {order.shipping_address},{' '}
                {order.shipping_city}, {order.shipping_country}
              </div>
            </div>
          ))}

          <div className="text-center pt-4">
            <Link to="/" className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
