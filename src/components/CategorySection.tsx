"use client";

import { motion } from "framer-motion";
import { fadeIn } from "@/components/variants";
import { useEffect, useState } from "react";
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

interface CategorySectionProps {
  title: string;
  category: string;
  image?: string;
}

export default function CategorySection({ title, category, image }: CategorySectionProps) {
  const [products, setProducts] = useState<Iproducts[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ products: Iproducts[] }>(`/products?category=${category}&page_size=4`)
      .then((data: any) => setProducts(data.products || data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <motion.div
      variants={fadeIn("up", 0.2)}
      initial="show"
      whileInView={"show"}
      viewport={{ once: false, amount: 0.1 }}
      className="w-full max-w-screen-2xl mx-auto mt-8 sm:mt-12 px-4 sm:px-8"
    >
      {/* Section Heading */}
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-black">
          {title}
        </h2>
        <Link
          href={`/all-products?category=${category}`}
          className="text-sm sm:text-base text-gray-500 hover:text-black font-medium underline transition-colors"
        >
          View All →
        </Link>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-400 text-sm">No products available in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {products.slice(0, 4).map((data) => (
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
