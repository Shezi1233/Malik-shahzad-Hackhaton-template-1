"use client";
import { fadeIn } from "@/components/variants";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FaStar } from "react-icons/fa";

interface Iproducts {
  title: string;
  price: string;
  id: number;
  rating?: string;
  old_price?: string;
  img_url: string;
}

let product: Iproducts[] = [
  {
    title: "VERTICAL STRIPED SHIRT",
    id: 5,
    price: "$212",
    img_url: "/images/sell.png",
    old_price: "$223",
  },
  {
    title: "COURAGE GRAPHIC T-SHIRT",
    id: 6,
    price: "$145",
    img_url: "/images/sell2.png",
  },
  {
    title: "LOOSE FIT BERMUDA SHORTS",
    id: 7,
    price: "$80",
    img_url: "/images/sell3.png",
  },
  {
    title: "FADED SKINNY JEANS",
    id: 8,
    price: "$210",
    img_url: "/images/sell4.png",
  },
];

let star = [
  <FaStar key={1} />,
  <FaStar key={2} />,
  <FaStar key={3} />,
  <FaStar key={4} />,
  <FaStar key={5} />,
];

export default function Top_sell() {
  return (
    <motion.div
      variants={fadeIn("down", 0.2)}
      initial="hidden"
      whileInView={"show"}
      viewport={{ once: false, amount: 0.7 }}
      className="w-full h-full sm:h-[500px] mt-10"
    >
      {/* Top Selling Header */}
      <div className="flex justify-center items-center mt-8">
        <img className="mt-12 max-w-full h-auto" src="/images/top.png" alt="TOP SELLING" />
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 px-8 mt-10">
        {product.map((data) => {
          return (
            <div key={data.id} className="flex flex-col items-center">
              <Link href={`/products/${data.id}`}>
                <div className="w-full h-[250px] sm:h-[300px] md:h-[350px] bg-[#F0EEED] rounded-[20px] overflow-hidden">
                  <Image
                    src={data.img_url}
                    alt={data.title}
                    className="w-full h-full object-cover"
                    width={300}
                    height={300}
                  />
                </div>
              </Link>
              <div className="text-center mt-2">
                <p className="text-sm sm:text-lg font-bold">{data.title}</p>
                <div className="flex justify-center text-yellow-400 mt-1">
                  {star.map((icon, index) => (
                    <span key={index}>{icon}</span>
                  ))}
                </div>
                <p className="font-bold mt-2 text-sm sm:text-base">
                  {data.price}{" "}
                  {data.old_price && (
                    <span className="text-gray-400 font-bold line-through text-xs sm:text-sm">
                      {" "}
                      {data.old_price}
                    </span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
