"use client";

import { motion } from "framer-motion";
import { fadeIn } from "@/components/variants";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import ProductCard, { ProductCardSkeleton } from "@/components/ProductCard";

interface Iproducts {
  title: string;
  price: number;
  id: number;
  old_price?: number | null;
  img_url: string;
  rating: number;
}

interface FilterParams {
  min_price?: number;
  max_price?: number;
  sizes?: string;
  colors?: string;
  rating?: number;
  category?: string;
  search?: string;
}

interface CasualShirtsProps {
  filters?: FilterParams;
  onTotalChange?: (total: number) => void;
}

function buildQueryString(filters: FilterParams): string {
  const params = new URLSearchParams();

  if (filters.category) params.set("category", filters.category);
  if (filters.search) params.set("search", filters.search);
  if (filters.min_price !== undefined && filters.min_price > 0) params.set("min_price", String(filters.min_price));
  if (filters.max_price !== undefined && filters.max_price < 300) params.set("max_price", String(filters.max_price));
  if (filters.sizes) params.set("sizes", filters.sizes);
  if (filters.colors) params.set("colors", filters.colors);
  if (filters.rating !== undefined && filters.rating > 0) params.set("rating", String(filters.rating));

  const qs = params.toString();
  return qs ? `/products?${qs}` : "/products";
}

export default function CasualShirts({ filters = {}, onTotalChange }: CasualShirtsProps) {
  const [products, setProducts] = useState<Iproducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = buildQueryString(filters);
      const data = await api.get<any>(endpoint);
      const productList = data.products || data || [];
      setProducts(Array.isArray(productList) ? productList : []);
      if (onTotalChange) {
        onTotalChange(typeof data.total === "number" ? data.total : productList.length);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters, onTotalChange]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <motion.div
      variants={fadeIn("up", 0.2)}
      initial="show"
      whileInView="show"
      viewport={{ once: false, amount: 0.1 }}
      className="w-full max-w-screen-2xl mx-auto mt-10 px-4 sm:px-8"
    >
      {/* Section Heading */}
      <h1 className="text-3xl md:text-5xl font-black text-black text-center mb-8">
        NEW ARRIVALS
      </h1>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-400 text-lg">{error}</p>
          <button
            onClick={fetchProducts}
            className="mt-4 bg-black text-white px-6 py-2 rounded-full text-sm"
          >
            Try Again
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No products match your filters.</p>
          <p className="text-gray-300 text-sm mt-2">Try adjusting or clearing the filters.</p>
        </div>
      ) : (
        <>
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
          <div className="text-center text-gray-400 text-sm mt-8">
            Showing {products.length} product{products.length !== 1 ? "s" : ""}
          </div>
        </>
      )}
    </motion.div>
  );
}
