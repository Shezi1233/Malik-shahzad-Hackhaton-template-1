"use client"
import Image from "next/image";
import Link from "next/link";
import { FaStar } from "react-icons/fa";
import { motion } from "framer-motion";
import { fadeIn } from "@/components/variants";

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
    title: "T-SHIRT WITH TAPE DETAILS",
    id: 1,
    price: "$140",
    img_url: "/product1.png",
  },
  {
    title: "SKINNY FIT JEANS",
    id: 2,
    price: "$120",
    img_url: "/product2.png",
    old_price: "$200",
  },
  {
    title: "CHECKERED SHIRT",
    id: 3,
    price: "$120",
    img_url: "/product3.png",
  },
  {
    title: "SLEEVE STRIPED T-SHIRT",
    id: 4,
    price: "$120",
    img_url: "/product4.png",
    old_price: "$200",
  },
];

let star = [
  <FaStar key={1} />,
  <FaStar key={2} />,
  <FaStar key={3} />,
  <FaStar key={4} />,
  <FaStar key={5} />,
];

export default function Products() {
  return (
    <motion.div
      variants={fadeIn("up", 0.2)}
      initial="hidden"
      whileInView={"show"}
      viewport={{ once: false, amount: 0.7 }}
      className="w-full h-full sm:h-[500px] mt-10"
    >
      {/* New Arrivals Header */}
      <div className="flex justify-center items-center mt-9">
        <img
          className="max-w-full h-auto"
          src="/images/NEW ARRIVALS.png"
          alt="NEW ARRIVALS"
        />
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
                <p className="text-base sm:text-lg font-bold">{data.title}</p>
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
