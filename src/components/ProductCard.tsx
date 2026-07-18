"use client";

import Image from "next/image";
import Link from "next/link";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { useState } from "react";

interface IProductCard {
  title: string;
  price: number;
  id: number;
  old_price?: number | null;
  img_url: string;
  rating: number;
}

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.3;

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => {
        if (i < fullStars)
          return <FaStar key={i} className="text-yellow-400 text-xs sm:text-sm" />;
        if (i === fullStars && hasHalf)
          return <FaStarHalfAlt key={i} className="text-yellow-400 text-xs sm:text-sm" />;
        return <FaRegStar key={i} className="text-gray-300 text-xs sm:text-sm" />;
      })}
      <span className="text-gray-500 text-xs ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function ProductCard({
  title,
  price,
  id,
  old_price,
  img_url,
  rating,
}: IProductCard) {
  const [imgError, setImgError] = useState(false);

  const discount = old_price
    ? Math.round(((old_price - price) / old_price) * 100)
    : 0;

  return (
    <div className="group flex flex-col">
      <Link href={`/products/${id}`} className="block">
        <div className="relative w-full aspect-square bg-[#F0EEED] rounded-[20px] overflow-hidden mb-3">
          {imgError ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-100">
              <svg
                className="w-10 h-10 mb-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-xs">No image</span>
            </div>
          ) : (
            <Image
              src={img_url}
              alt={title}
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              width={400}
              height={400}
              onError={() => setImgError(true)}
              priority={id <= 8}
             
            />
          )}

          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-col gap-1 px-1">
        <h3 className="text-sm sm:text-base font-semibold text-gray-800 truncate">
          {title}
        </h3>
        <StarRating rating={rating} />
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-base sm:text-lg font-bold text-gray-900">
            ${price}
          </span>
          {old_price && (
            <>
              <span className="text-sm text-gray-400 line-through">
                ${old_price}
              </span>
              <span className="text-xs text-red-500 font-medium bg-red-50 px-1.5 py-0.5 rounded-full">
                -{discount}%
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Loading skeleton
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="w-full aspect-square bg-gray-200 rounded-[20px] mb-3" />
      <div className="space-y-2 px-1">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  );
}
