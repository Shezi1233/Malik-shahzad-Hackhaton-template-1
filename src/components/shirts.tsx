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

export default function CasualShirts() {
  return (
    <motion.div
     variants={fadeIn("up", 0.2)}
          initial="hidden"
          whileInView={"show"}
          viewport={{ once: false, amount: 0.7 }}
    
    className="w-full h-full sm:h-auto mt-10">
      <h1 className="text-3xl md:text-5xl font-black text-black text-center">
        NEW ARRIVALS
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-4 md:px-8 mt-10">
        {product.map((data) => {
          return (
            <div key={data.id} className="flex flex-col items-center">
              <Link href={`/products/${data.id}`}>
                <div className="w-full aspect-w-1 aspect-h-1 bg-[#F0EEED] rounded-[20px] overflow-hidden">
                  <Image
                    src={data.img_url}
                    alt={data.title}
                    className="object-cover w-full h-full"
                    width={500}
                    height={500}
                    priority
                  />
                </div>
              </Link>
              <div className="text-center mt-4">
                <p className="text-lg font-bold text-gray-800">{data.title}</p>
                <div className="flex justify-center text-yellow-400 mt-1">
                  {star.map((icon, index) => (
                    <span key={index}>{icon}</span>
                  ))}
                </div>
                <p className="font-bold text-lg mt-2 text-gray-900">
                  {data.price}
                  {data.old_price && (
                    <span className="text-gray-400 font-normal text-sm line-through ml-2">
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