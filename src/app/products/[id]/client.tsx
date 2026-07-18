"use client";

import Image from "next/image";
import { FaStar } from "react-icons/fa";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/buttons";
import { Check, Minus, Plus, ShoppingCart } from "lucide-react";
import AllReviw from "@/components/allreviws";
import Tshirts from "@/components/products";
import { BreadcrumbDemo } from "@/components/Bredcrupm";
import Chatbot from "@/components/chatbot";
import { motion } from "framer-motion";
import { fadeIn } from "@/components/variants";
import { useCart } from "@/components/cartContext";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

let star = [
  <FaStar key={1} />,
  <FaStar key={2} />,
  <FaStar key={3} />,
  <FaStar key={4} />,
  <FaStar key={5} />,
];

interface IProduct {
  id: number;
  title: string;
  price: number;
  old_price?: number | null;
  img_url: string;
  img1?: string | null;
  img2?: string | null;
  img3?: string | null;
  description: string;
  colors: string[];
  sizes: string[];
  rating: number;
}

/** Check if two image URLs likely point to different files */
function isDifferentImage(a: string, b: string) {
  if (!a || !b) return false;
  const nameA = a.split("/").pop() || a;
  const nameB = b.split("/").pop() || b;
  return nameA !== nameB;
}

function ProductImage({
  src,
  alt,
  className = "",
  width = 580,
  height = 580,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        className={`flex flex-col items-center justify-center text-gray-400 bg-gray-100 ${className}`}
      >
        <svg className="w-10 h-10 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="text-xs">No image</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      priority={priority}
     
      onError={() => setError(true)}
    />
  );
}

export default function ProductDetailClient({ productId }: { productId?: number }) {
  const params = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");

  useEffect(() => {
    const idToFetch = productId || Number(params.id);
    if (!idToFetch) return;
    api
      .get<IProduct>(`/products/${idToFetch}`)
      .then((data) => {
        setProduct(data);
        // Always default to img_url — it's the most reliable image
        setSelectedImage(data.img_url);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
          <span className="text-gray-400 text-sm">Loading product...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Product not found
          </h1>
          <p className="text-gray-400">
            The product you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      img_url: product.img_url,
      quantity: quantity,
      size: selectedSize,
      color: selectedColor,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // Only include thumbnails that are DIFFERENT from each other
  const allImages = [product.img_url, product.img1, product.img2, product.img3].filter(
    (img): img is string => !!img
  );
  const thumbnails = allImages.filter(
    (img, i) => i === 0 || isDifferentImage(img, allImages[0])
  ).slice(0, 4);

  return (
    <>
      <BreadcrumbDemo />
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Thumbnails */}
          <div className="order-2 lg:order-1 flex lg:flex-col gap-3 justify-center">
            {thumbnails.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(img)}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-[14px] overflow-hidden border-2 transition-all flex-shrink-0 ${
                  selectedImage === img
                    ? "border-black ring-1 ring-black"
                    : "border-transparent hover:border-gray-300"
                }`}
              >
                <ProductImage
                  src={img}
                  alt={`${product.title} ${i + 1}`}
                  className="w-full h-full object-cover"
                  width={80}
                  height={80}
                />
              </button>
            ))}
          </div>

          {/* Main Image */}
          <motion.div
            variants={fadeIn("up", 0.2)}
            initial="hidden"
            whileInView={"show"}
            viewport={{ once: false, amount: 0.7 }}
            className="order-1 lg:order-2 w-full lg:w-[500px] xl:w-[580px] aspect-square bg-[#F0EEED] rounded-[20px] overflow-hidden"
          >
            <ProductImage
              src={selectedImage}
              alt={product.title}
              className="w-full h-full object-contain"
              width={580}
              height={580}
              priority
            />
          </motion.div>

          {/* Product Details */}
          <motion.div
            variants={fadeIn("down", 0.2)}
            initial="hidden"
            whileInView={"show"}
            viewport={{ once: false, amount: 0.7 }}
            className="order-3 flex-1 min-w-0"
          >
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-1 mt-3">
              <div className="flex text-yellow-400">
                {star.map((icon, index) => (
                  <span key={index} className="text-sm">{icon}</span>
                ))}
              </div>
              <span className="text-gray-500 text-sm ml-2">
                {product.rating}/5
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mt-4">
              <p className="text-2xl md:text-3xl font-bold text-gray-900">
                ${product.price}
              </p>
              {product.old_price && (
                <>
                  <p className="text-lg md:text-xl text-gray-400 line-through">
                    ${product.old_price}
                  </p>
                  <span className="bg-red-50 text-red-500 text-sm px-2.5 py-0.5 rounded-full font-medium">
                    -
                    {Math.round(
                      ((product.old_price - product.price) /
                        product.old_price) *
                        100
                    )}
                    %
                  </span>
                </>
              )}
            </div>

            <p className="mt-6 text-gray-600 leading-relaxed">
              {product.description}
            </p>

            <hr className="my-6 border-gray-200" />

            {/* Select Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-3">
                  Select Colors{" "}
                  <span className="text-black font-medium">
                    {selectedColor && `— ${selectedColor}`}
                  </span>
                </p>
                <div className="flex space-x-3">
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(color)}
                      className={`w-[37px] h-[37px] rounded-full flex justify-center items-center transition-all ${
                        selectedColor === color
                          ? "ring-2 ring-black ring-offset-2 scale-110"
                          : ""
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {selectedColor === color && (
                        <Check className="text-white w-4 h-4" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Choose Size */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-3">
                  Choose Size{" "}
                  <span className="text-black font-medium">
                    {selectedSize && `— ${selectedSize}`}
                  </span>
                </p>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                        selectedSize === size
                          ? "bg-black text-white shadow-md"
                          : "bg-[#F0F0F0] text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-4 mt-8">
              <div className="flex items-center gap-4 bg-[#F0F0F0] rounded-full px-4 py-2.5">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="hover:text-black text-gray-500 transition-colors"
                >
                  <Minus size={18} />
                </button>
                <span className="font-medium w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="hover:text-black text-gray-500 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>

              <Button
                className={`flex-1 rounded-full py-6 text-base font-medium transition-all ${
                  addedToCart ? "bg-green-600 hover:bg-green-700" : ""
                }`}
                onClick={handleAddToCart}
              >
                <ShoppingCart size={18} className="mr-2" />
                {addedToCart ? "Added!" : "Add to Cart"}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
      <AllReviw />
      <Tshirts />
      <Chatbot />
    </>
  );
}
