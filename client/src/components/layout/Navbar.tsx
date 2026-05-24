import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-600 flex-shrink-0">
            Helfy
          </Link>

          {/* Right side */}
          <div className="flex items-center space-x-3 sm:space-x-6">
            {/* Home — hide on mobile, logo already goes home */}
            <Link
              to="/"
              className="hidden sm:block text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Home
            </Link>

            {!loading && (
              <>
                {isAuthenticated ? (
                  <>
                    {/* Cart with badge */}
                    <Link
                      to="/cart"
                      className="relative text-gray-700 hover:text-blue-600 transition-colors font-medium"
                    >
                      Cart
                      {itemCount > 0 && (
                        <span className="absolute -top-2.5 -right-4 bg-blue-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full leading-none">
                          {itemCount > 99 ? '99+' : itemCount}
                        </span>
                      )}
                    </Link>

                    {/* Orders — hidden on mobile, accessible via Account page */}
                    <Link
                      to="/orders"
                      className="hidden sm:block text-gray-700 hover:text-blue-600 transition-colors font-medium"
                    >
                      Orders
                    </Link>

                    <Link
                      to="/account"
                      className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                    >
                      Account
                    </Link>

                    <span className="text-gray-400 text-sm font-medium hidden lg:inline truncate max-w-[120px]">
                      {user?.name}
                    </span>

                    <button
                      onClick={handleLogout}
                      className="text-gray-700 hover:text-red-600 transition-colors font-medium"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm sm:text-base"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
