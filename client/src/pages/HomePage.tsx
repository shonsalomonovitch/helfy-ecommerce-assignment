import { useState, useEffect, useCallback } from "react";
import PageContainer from "../components/layout/PageContainer";
import ProductFilters from "../components/products/ProductFilters";
import ProductGrid from "../components/products/ProductGrid";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import { getProducts } from "../api/productsApi";
import type {
  Product,
  ProductFilters as ProductFiltersType,
} from "../types/product.types";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (filters?: ProductFiltersType) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts(filters);
      setProducts(data);
    } catch {
      setError(
        "Failed to load products. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <PageContainer>
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-xl p-12 mb-12 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 20%, white 0%, transparent 60%)",
          }}
        />
        <div className="relative max-w-2xl">
          <h1 className="text-5xl font-bold mb-4 tracking-tight">
            Welcome to Helfy
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Discover premium products across electronics, fashion, fitness, and
            more.
          </p>
          <a
            href="#catalog"
            className="inline-block bg-white text-blue-700 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-md"
          >
            Shop Now
          </a>
        </div>
      </div>

      {/* Catalog */}
      <section id="catalog">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">All Products</h2>

        <ProductFilters
          onApplyFilters={(filters) => fetchProducts(filters)}
          onClearFilters={() => fetchProducts()}
        />

        {loading ? (
          <LoadingState message="Loading products..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchProducts()} />
        ) : (
          <ProductGrid products={products} />
        )}
      </section>
    </PageContainer>
  );
}
