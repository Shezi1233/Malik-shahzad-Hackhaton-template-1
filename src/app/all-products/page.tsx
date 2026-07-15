"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { fadeIn } from "@/components/variants";
import { api } from "@/lib/api";
import ProductCard, { ProductCardSkeleton } from "@/components/ProductCard";
import Link from "next/link";

interface Iproducts {
  title: string;
  price: number;
  id: number;
  old_price?: number | null;
  img_url: string;
  rating: number;
}

const CATEGORIES = [
  { value: "", label: "All Products" },
  { value: "new_arrivals", label: "New Arrivals" },
  { value: "t-shirts", label: "T-Shirts" },
  { value: "shirts", label: "Shirts" },
  { value: "pants", label: "Pants & Jeans" },
  { value: "shorts", label: "Shorts" },
  { value: "outerwear", label: "Outerwear" },
  { value: "hoodies", label: "Hoodies" },
  { value: "dresses", label: "Dresses" },
  { value: "activewear", label: "Activewear" },
  { value: "top_selling", label: "Top Selling" },
];

function AllProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams.get("category") || "";
  const [products, setProducts] = useState<Iproducts[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const endpoint = category
      ? `/products?category=${category}&page_size=50`
      : "/products?page_size=50";
    api
      .get<{ products: Iproducts[] }>(endpoint)
      .then((data: any) => setProducts(data.products || data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category]);

  const selectedLabel = CATEGORIES.find((c) => c.value === category)?.label || "All Products";

  return (
    <motion.div
      variants={fadeIn("up", 0.2)}
      initial="show"
      whileInView="show"
      viewport={{ once: false, amount: 0.1 }}
      className="w-full max-w-screen-2xl mx-auto mt-6 px-4 sm:px-8"
    >
      {/* Breadcrumb */}
      <div className="text-sm text-gray-400 mb-4">
        <Link href="/" className="hover:text-black">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-black font-medium">{selectedLabel}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-black">
          {selectedLabel}
        </h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">Category:</label>
          <select
            value={category}
            onChange={(e) => {
              const val = e.target.value;
              router.push(val ? `/all-products?category=${val}` : "/all-products");
            }}
            className="border rounded-full px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No products found.</p>
          <p className="text-gray-300 text-sm mt-2">Try a different category.</p>
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
          <div className="text-center text-gray-400 text-sm mt-8 mb-10">
            Showing {products.length} product{products.length !== 1 ? "s" : ""}
          </div>
        </>
      )}
    </motion.div>
  );
}

export default function AllProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
        </div>
      }
    >
      <AllProductsContent />
    </Suspense>
  );
}
