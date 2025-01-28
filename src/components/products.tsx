import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FaStar } from "react-icons/fa";
import { fadeIn } from "./variants";

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
    title: "Polo with Contrast Trims",
    id: 9,
    price: "$212",
    img_url: "/images/Frame 1.png",
    old_price: "$242",
  },
  {
    title: "Gradient Graphic T-shirt",
    id: 10,
    price: "$145",
    img_url: "/images/Frame 2.png",
  },
  {
    title: "Polo with Tipping Details",
    id: 11,
    price: "$180",
    img_url: "/images/Frame 3.png",
  },
  {
    title: "Black Striped T-shirt",
    id: 12,
    price: "$120",
    img_url: "/images/Frame 4.png",
    old_price: "$150",
  },
];

let star = [
  <FaStar key={1} />,
  <FaStar key={2} />,
  <FaStar key={3} />,
  <FaStar key={4} />,
  <FaStar key={5} />,
];

export default function Tshirts() {
  return (
    <motion.div
      variants={fadeIn("up", 0.2)}
      initial="hidden"
      whileInView={"show"}
      viewport={{ once: false, amount: 0.7 }}
      className="w-full h-full mt-10 max-w-screen-2xl mx-auto"
    >
      <div className="flex justify-center items-center">
        <img className="mt-7 mb-6" src="/images/productpage.png" alt="Product Banner" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-8 mt-10 mx-11">
        {product.map((data) => {
          return (
            <div key={data.id} className="bg-[#F0EEED] rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300">
              <Link href={`/products/${data.id}`}>
                <div className="relative w-full h-56 overflow-hidden rounded-2xl">
                  <Image
                    src={data.img_url}
                    alt={data.title}
                    className="w-full h-full object-cover"
                    width={100}
                    height={100}
                  />
                </div>
              </Link>
              <div className="mt-4">
                <p className="text-lg font-semibold text-gray-800 truncate">{data.title}</p>
                <div className="flex text-yellow-400 mt-2">
                  {star.map((icon, index) => (
                    <span key={index}>{icon}</span>
                  ))}
                </div>
                <p className="font-bold mt-1 text-lg text-gray-800">
                  {data.price}{" "}
                  {data.old_price && (
                    <span className="text-gray-400 font-bold line-through">
                      {" "}
                      {data.old_price}{" "}
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
