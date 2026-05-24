import { Link } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import { useAuth } from '../context/AuthContext';

export default function AccountPage() {
  const { user, logout } = useAuth();

  if (!user) return null;

  // Initials for avatar
  const initials = user.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <PageContainer>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>

      <div className="max-w-2xl space-y-6">
        {/* Profile card */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 flex items-center gap-6">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-gray-900 truncate">{user.name}</h2>
            <p className="text-gray-500 mt-0.5 truncate">{user.email}</p>
            {user.created_at && (
              <p className="text-xs text-gray-400 mt-1">
                Member since {new Date(user.created_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/orders"
            className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 hover:border-blue-200 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Order History</p>
                <p className="text-sm text-gray-500">View your past orders</p>
              </div>
            </div>
          </Link>

          <Link
            to="/cart"
            className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 hover:border-blue-200 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Shopping Cart</p>
                <p className="text-sm text-gray-500">View your current cart</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Sign out */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-700 mb-4">Account Actions</h3>
          <button
            onClick={logout}
            className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
