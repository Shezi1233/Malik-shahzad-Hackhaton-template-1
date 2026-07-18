"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/components/authContext";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, ArrowLeft } from "lucide-react";

interface WishlistItem {
  id: number;
  product_id: number;
  title: string;
  price: number;
  old_price: number | null;
  img_url: string;
  rating: number;
  created_at: string;
}

export default function Wishlist() {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    api
      .get<{ items: WishlistItem[]; total: number }>("/wishlist")
      .then((data) => setItems(data.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [user]);

  const removeFromWishlist = async (productId: number) => {
    setRemovingId(productId);
    try {
      await api.delete(`/wishlist/${productId}`);
      setItems((prev) => prev.filter((item) => item.product_id !== productId));
    } catch {
      // Silently fail
    } finally {
      setRemovingId(null);
    }
  };

  // Not signed in
  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Heart className="w-7 h-7 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Sign in to View Wishlist</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Save your favorite items and come back to them anytime.
          </p>
          <Link href="/signin">
            <button className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">
              Sign In
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {items.length} {items.length === 1 ? "item" : "items"} saved
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-100 rounded-[20px] mb-3" />
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && items.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-7 h-7 text-gray-300" />
          </div>
          <p className="text-gray-500 text-lg mb-2">Your wishlist is empty</p>
          <p className="text-gray-400 text-sm mb-6">
            Start saving your favorite items!
          </p>
          <Link href="/all-products">
            <button className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors inline-flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Browse Products
            </button>
          </Link>
        </div>
      )}

      {/* Wishlist Grid */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item) => (
            <div key={item.id} className="group relative">
              <Link href={`/products/${item.product_id}`}>
                <div className="aspect-square bg-[#F0EEED] rounded-[20px] overflow-hidden mb-3">
                  <Image
                    src={item.img_url}
                    alt={item.title}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                   
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/products/product_1.png";
                    }}
                  />
                </div>
              </Link>

              {/* Remove button */}
              <button
                onClick={() => removeFromWishlist(item.product_id)}
                disabled={removingId === item.product_id}
                className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all hover:scale-110 disabled:opacity-50"
                aria-label="Remove from wishlist"
              >
                {removingId === item.product_id ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
                ) : (
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                )}
              </button>

              {/* Product info */}
              <Link href={`/products/${item.product_id}`}>
                <h3 className="font-bold text-sm sm:text-base text-gray-900 truncate">
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <p className="font-bold text-sm sm:text-base">
                    ${item.price}
                  </p>
                  {item.old_price && (
                    <>
                      <p className="text-xs sm:text-sm text-gray-400 line-through">
                        ${item.old_price}
                      </p>
                      <span className="text-[10px] text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full font-medium">
                        -{Math.round(((item.old_price - item.price) / item.old_price) * 100)}%
                      </span>
                    </>
                  )}
                </div>
                {/* Rating */}
                <div className="flex items-center gap-1 mt-1">
                  <div className="flex text-yellow-400 text-xs">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-3.5 h-3.5 ${i < Math.floor(item.rating) ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{item.rating}/5</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
