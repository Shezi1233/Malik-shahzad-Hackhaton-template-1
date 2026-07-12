"use client";

import { motion } from "framer-motion";
import { fadeIn } from "@/components/variants";
import { useEffect, useState } from "react";
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

export default function Top_sell() {
  const [products, setProducts] = useState<Iproducts[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<any>("/products?category=top_selling")
      .then((data) => setProducts(data.products || data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div
      variants={fadeIn("down", 0.2)}
      initial="show"
      whileInView={"show"}
      viewport={{ once: false, amount: 0.1 }}
      className="w-full max-w-screen-2xl mx-auto mt-10 px-4 sm:px-8"
    >
      {/* Section Heading */}
      <div className="flex justify-center items-center mb-6">
        <img
          className="max-w-full h-auto"
          src="/images/top.png"
          alt="TOP SELLING"
        />
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No products available.</p>
        </div>
      ) : (
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

      {/* View All Link */}
      <div className="flex justify-center mt-8">
        <a
          href="/products/all"
          className="px-16 py-3 border border-gray-300 rounded-full text-gray-600 font-medium hover:bg-gray-50 transition-colors"
        >
          View All
        </a>
      </div>
    </motion.div>
  );
}
