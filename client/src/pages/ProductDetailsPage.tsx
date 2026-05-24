import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import PageContainer from "../components/layout/PageContainer";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import { getProductById } from "../api/productsApi";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import type { Product } from "../types/product.types";

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setNotFound(false);
    setImgError(false);

    getProductById(id)
      .then(setProduct)
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setNotFound(true);
        } else {
          setError("Failed to load product. Please try again.");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <PageContainer>
        <LoadingState message="Loading product..." />
      </PageContainer>
    );
  }

  if (notFound) {
    return (
      <PageContainer>
        <div className="text-center py-24">
          <div className="text-gray-300 mb-6 flex justify-center">
            <svg
              className="w-20 h-20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Product Not Found
          </h1>
          <p className="text-gray-500 mb-8">
            This product doesn't exist or may have been removed.
          </p>
          <Link
            to="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Back to Catalog
          </Link>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </PageContainer>
    );
  }

  if (!product) return null;

  const isOutOfStock = product.stock === 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/products/${id}` } });
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart(product.id);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch {
      // error is surfaced via CartContext; no need to duplicate here
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <PageContainer>
      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium mb-10 transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Product Image */}
        <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-square shadow-sm">
          {!imgError ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg
                className="w-24 h-24"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          {/* Category badge */}
          <span className="inline-block self-start bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full mb-4">
            {product.category}
          </span>

          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {product.name}
          </h1>

          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            {product.description}
          </p>

          {/* Price */}
          <div className="text-4xl font-bold text-gray-900 mb-5">
            ${Number(product.price).toFixed(2)}
          </div>

          {/* Stock status */}
          <div className="mb-8">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-2 text-red-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Out of stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-green-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {product.stock} in stock
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || addingToCart}
            className={`w-full sm:w-auto font-semibold px-10 py-4 rounded-xl text-lg transition-colors shadow-md flex items-center justify-center gap-2 ${
              addedToCart
                ? "bg-green-600 text-white"
                : isOutOfStock
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white"
            }`}
          >
            {addingToCart && (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {addedToCart
              ? "Added to Cart!"
              : isOutOfStock
                ? "Out of Stock"
                : "Add to Cart"}
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
