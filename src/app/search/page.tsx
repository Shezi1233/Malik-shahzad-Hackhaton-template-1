"use client";

import { motion } from "framer-motion";
import { fadeIn } from "@/components/variants";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import ProductCard, { ProductCardSkeleton } from "@/components/ProductCard";

interface IProduct {
  title: string;
  price: number;
  id: number;
  old_price?: number | null;
  img_url: string;
  rating: number;
}

function SearchPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(query);

  useEffect(() => {
    setSearchTerm(query);
  }, [query]);

  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .get<{ products: IProduct[]; total: number }>(
        `/products/search?q=${encodeURIComponent(query)}`
      )
      .then((data) => setProducts(data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <motion.div
      variants={fadeIn("up", 0.2)}
      initial="show"
      whileInView="show"
      viewport={{ once: false, amount: 0.1 }}
      className="w-full max-w-screen-2xl mx-auto mt-6 px-4 sm:px-8"
    >
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
        <div className="flex items-center bg-[#F0F0F0] rounded-full px-5 py-3 gap-3 focus-within:ring-2 focus-within:ring-gray-300 transition-all">
          <svg
            className="w-5 h-5 text-gray-400 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search for products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 outline-none bg-transparent text-sm text-gray-800"
            autoFocus
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                router.push("/search");
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button
            type="submit"
            className="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors flex-shrink-0"
          >
            Search
          </button>
        </div>
      </form>

      {/* Results Header */}
      {query && (
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {loading
              ? "Searching..."
              : products.length > 0
              ? `${products.length} result${products.length !== 1 ? "s" : ""} for "${query}"`
              : `No results for "${query}"`}
          </h1>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : !query.trim() ? (
        /* No query - show search prompt */
        <div className="text-center py-24">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            Search for products
          </h2>
          <p className="text-gray-400">
            Find your favorite clothing items from our collection
          </p>
        </div>
      ) : products.length === 0 ? (
        /* No results */
        <div className="text-center py-24">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-gray-300"
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
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            No products found
          </h2>
          <p className="text-gray-400 mb-6">
            Try searching with different keywords
          </p>
          <Link
            href="/products"
            className="inline-block bg-black text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Browse All Products
          </Link>
        </div>
      ) : (
        /* Results grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {products.map((data) => (
            <ProductCard
              key={data.id}
              id={data.id}
              title={data.title}
              price={data.price}
              old_price={data.old_price}
              img_url={data.img_url}
              rating={data.rating}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
        </div>
      }
    >
      <SearchPageInner />
    </Suspense>
  );
}
