"use client";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/buttons";
import { Check, Minus, Plus } from "lucide-react";
import AllReviw from "@/components/allreviws";
import Tshirts from "@/components/products";
import { BreadcrumbDemo } from "@/components/Bredcrupm";
import Chatbot from "@/components/chatbot";
import LazyLoadImage from "@/components/lazyload";
import { motion } from "framer-motion";
import { fadeIn } from "@/components/variants";
import { useCart } from "@/components/cartContext";

// Adding key prop in star array
let star = [
  <FaStar key={1} />,
  <FaStar key={2} />,
  <FaStar key={3} />,
  <FaStar key={4} />,
  <FaStar key={5} />,
];

interface Iproducts {
  title: string;
  price: number; // Changed price to number
  id: number;
  rating?: string;
  old_price?: number;
  description: string;
  img_url: string;
  img1: string;
  img2: string;
  img3: string;
}

let product: Iproducts[] = [
  {
    title: "T-SHIRT WITH TAPE DETAILS",
    id: 1,
    price: 140,
    img_url: "/product1.png",
    img1: "/detail1.png",
    img2: "/detail2.png",
    img3: "/product1.png",
    description:
      "A stylish t-shirt with unique tape detailing along the shoulders. Perfect for a casual day out.",
  },
  {
    title: "SKINNY FIT JEANS",
    id: 2,
    price: 120,
    old_price: 200,
    img_url: "/product2.png",
    img1: "/product2.png",
    img2: "/detail2.png",
    img3: "/product2.png",
    description:
      "Slim-fit jeans with a flattering cut and comfortable stretch. A great pair to complement your casual wardrobe.",
  },
  {
    title: "CHECKERED SHIRT",
    id: 3,
    price: 120,
    img_url: "/product3.png",
    img1: "/detail1.png",
    img2: "/detail2.png",
    img3: "/product3.png",
    description: "A trendy checkered shirt for a laid-back, yet stylish look. Made from soft fabric for all-day comfort."
  },
  {
    title: "SLEEVE STRIPED T-SHIRT",
    id: 4,
    price: 120,
    old_price: 200,
    img_url: "/product4.png",
    img1: "/detail1.png",
    img2: "/detail2.png",
    img3: "/product4.png",
    description: "This striped t-shirt adds a sporty touch with its bold sleeve design. A versatile piece for any casual occasion."
  },
  {
    title: "VERTICAL STRIPED SHIRT",
    id: 5,
    price: 212,
    old_price: 232,
    img_url: "/images/sell.png",
    img1: "/detail1.png",
    img2: "/detail2.png",
    img3: "/images/sell.png",
    description: "A classic vertical striped shirt that pairs well with both jeans and dress pants. A stylish option for every season."
  },
  {
    title: "COURAGE GRAPHIC T-SHIRT",
    id: 6,
    price: 145,
    img_url: "/images/sell2.png",
    img1: "/detail1.png",
    img2: "/detail2.png",
    img3: "/images/sell2.png",
    description: "A bold graphic tee featuring an inspiring 'Courage' message. Perfect for making a statement while staying comfortable."
  },
  {
    title: "LOOSE FIT BERMUDA SHORTS",
    id: 7,
    price: 80,
    img_url: "/images/sell3.png",
    img1: "/detail1.png",
    img2: "/detail2.png",
    img3: "/images/sell3.png",
    description: "Relaxed-fit bermuda shorts that are perfect for warm weather. A must-have for comfort during the summer months."
  },
  {
    title: "FADED SKINNY JEANS",
    id: 8,
    price: 210,
    img_url: "/images/sell4.png",
    img1: "/detail1.png",
    img2: "/detail2.png",
    img3: "/images/sell4.png",
    description: "Skinny jeans with a trendy faded look, offering a sleek fit and ultimate comfort for daily wear."
  },
  {
    title: "Polo with Contrast Trims",
    id: 9,
    price: 212,
    old_price: 242,
    img_url: "/images/Frame 1.png",
    img1: "/detail1.png",
    img2: "/detail2.png",
    img3: "/images/Frame 1.png",
    description: "A stylish polo shirt with contrast trims, perfect for both casual and semi-formal occasions. A wardrobe staple."
  },
  {
    title: "Gradient Graphic T-shirt",
    id: 10,
    price: 145,
    img_url: "/images/Frame 2.png",
    img1: "/detail1.png",
    img2: "/detail2.png",
    img3: "/images/Frame 2.png",
    description: "A modern graphic tee featuring a gradient design, adding a pop of color and creativity to your outfit."
  },
  {
    title: "Polo with Tipping Details",
    id: 11,
    price: 180,
    img_url: "/images/Frame 3.png",
    img1: "/detail1.png",
    img2: "/detail2.png",
    img3: "/images/Frame 3.png",
    description: "A polo shirt with tipping details along the collar and sleeves for a refined, sporty look."
  },
  {
    title: "Black Striped T-shirt",
    id: 12,
    price: 120,
    old_price: 150,
    img_url: "/images/Frame 4.png",
    img1: "/detail1.png",
    img2: "/detail2.png",
    img3: "/images/Frame 4.png",
    description: "A sleek black striped t-shirt that adds a subtle edge to your casual look. Perfect for day-to-night wear."
  },
  // Add remaining products here if any
];

export default function Pro_Detail() {
  const params = useParams();
  const { addToCart } = useCart(); // Importing the addToCart function from useCart
  const id = params.id; // dynamic id
  const item = product.find((item) => item.id === Number(id));

  if (!item) {
    return <h1>Product not found</h1>;
  }

  const handleAddToCart = () => {
    addToCart({
      id: item.id,
      title: item.title,
      price: item.price,
      img_url: item.img_url,
      quantity: 1, // Default quantity
    });
    alert(`${item.title} added to cart`);
  };

  return (
    <>
      <BreadcrumbDemo />
      <div className="flex flex-col md:flex-row justify-center sm:justify-evenly sm:mt-10 p-5 sm:p-0 max-w-screen-2xl mx-auto">
        {/* Left */}
        <div className="flex sm:flex-col justify-between items-center w-full sm:w-[152px] order-2 sm:order-1">
          {/* Images */}
          <LazyLoadImage
            className="w-[100px] sm:w-full h-[100px] sm:h-[150px]"
            src={item.img1}
            alt="product detail"
            width={100}
            height={100}
          />
          <LazyLoadImage
            src={item.img2}
            className="w-[100px] sm:w-full h-[100px] sm:h-[150px] sm:mt-3"
            alt="product detail"
            width={100}
            height={100}
          />
          <LazyLoadImage
            src={item.img3}
            className="w-[100px] sm:w-full h-[100px] sm:h-[150px] sm:mt-3"
            alt="product detail"
            width={100}
            height={100}
          />
        </div>

        {/* Middle */}
        <motion.div
          variants={fadeIn("up", 0.2)}
          initial="hidden"
          whileInView={"show"}
          viewport={{ once: false, amount: 0.7 }}
          className="w-full sm:w-[444px] h-[260px] sm:h-[500px] mt-5 sm:mt-0 order-1 sm:order-2"
        >
          <Image
            src={item.img3}
            alt="product detail"
            className="w-full h-[95%]"
            width={100}
            height={100}
          />
        </motion.div>

        {/* Right */}
        <motion.div
          variants={fadeIn("down", 0.2)}
          initial="hidden"
          whileInView={"show"}
          viewport={{ once: false, amount: 0.7 }}
          className="w-full sm:w-[600px] h-[500px] mt-3 order-3"
        >
          <h1 className="text-2xl md:text-3xl font-bold">{item.title}</h1>
          <div className="flex text-yellow-400">
            {star.map((icon, index) => (
              <span key={index}>{icon}</span>
            ))}
          </div>
          <p className="font-bold mt-1">
            ${item.price}{" "}
            <span>{item.old_price ? `$${item.old_price}` : ""}</span>
          </p>
          <p className="mt-8">{item.description}</p>

          {/* Select Colors */}
          <div className="mt-5">
            <p className="text-gray-500">Select Colors</p>
            <div className="flex space-x-3 mt-2">
              <div className="w-[37px] h-[37px] bg-[#4F4631] rounded-full flex justify-center items-center">
                <Check className="text-white opacity-0 hover:opacity-100 cursor-pointer" />
              </div>
              <div className="w-[37px] h-[37px] bg-[#314F4A] rounded-full flex justify-center items-center">
                <Check className="text-white opacity-0 hover:opacity-100 cursor-pointer" />
              </div>
              <div className="w-[37px] h-[37px] bg-[#31344F] rounded-full flex justify-center items-center">
                <Check className="text-white opacity-0 hover:opacity-100 cursor-pointer" />
              </div>
            </div>
          </div>

          {/* Choose Size */}
          <div className="mt-4">
            <p className="text-gray-500">Sizes</p>
            <div className="flex space-x-3 mt-2">
              <div className="w-[80px] h-[40px] flex justify-center items-center rounded-[62px] bg-black text-white">
                <button>Small</button>
              </div>
              <div className="w-[90px] h-[40px] flex justify-center items-center rounded-[62px] bg-black text-white">
                <button>Medium</button>
              </div>
              <div className="w-[80px] h-[40px] flex justify-center items-center rounded-[62px] bg-black text-white">
                <button>Large</button>
              </div>
              <div className="w-[90px] h-[40px] flex justify-center items-center rounded-[62px] bg-black text-white">
                <button>X-Large</button>
              </div>
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="flex justify-start items-center mt-8 space-x-4">
            <Button className="mt-10 rounded-full w-[400px]" onClick={handleAddToCart}>Add to Cart</Button>
          </div>
        </motion.div>
      </div>
      <AllReviw />
      <Tshirts />
      <Chatbot />
    </>
  );
}
