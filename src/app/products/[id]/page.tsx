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
  price: string;
  id: number;
  rating?: string;
  old_price?: string;
  img_url: string;
  img1: string;
  img2: string;
  img3: string;
}

let product: Iproducts[] = [
  {
    title: "T-SHIRT WITH TAPE DETAILS",
    id: 1,
    price: "$140",
    img_url: "/product1.png",
    img1: "/detail1.png",
    img2: "/detail2.png",
    img3: "/product1.png",
  },
  {
    title: "SKINNY FIT JEANS",
    id: 2,
    price: "$120",
    img_url: "/product2.png",
    old_price: "$200",
    img1: "/product2.png",
    img2: "/detail2.png",
    img3: "/product2.png",
  },
  {
    title: "CHECKERED SHIRT",
    id: 3,
    price: "$120",
    img_url: "/product3.png",
    img1: "/detail1.png",
    img2: "/detail2.png",
    img3: "/product3.png",
  },
  {
    title: "SLEEVE STRIPED T-SHIRT",
    id: 4,
    price: "$120",
    img_url: "/product4.png",
    old_price: "$200",
    img1: "/detail1.png",
    img2: "/detail2.png",
    img3: "/product4.png",
  },
  {
    title: "VERTICAL STRIPED SHIRT",
    id: 5,
    price: "$212",
    img_url: "/sell1.png",
    old_price: "$232",
    img1: "/detail1.png",
    img2: "/detail2.png",
    img3: "/images/sell.png",
  },
  {
    title: "COURAGE GRAPHIC T-SHIRT",
    id: 6,
    price: "$145",
    img_url: "/sell1.png",
    img1: "/detail1.png",
    img2: "/detail2.png",
    img3: "/images/sell2.png",
  },
  {
    title: "LOOSE FIT BERMUDA SHORTS",
    id: 7,
    price: "$80",
    img_url: "/sell1.png",
    img1: "/detail1.png",
    img2: "/detail2.png",
    img3: "/images/sell3.png",
  },
  {
    title: "FADED SKINNY JEANS",
    id: 8,
    price: "$210",
    img_url: "/sell1.png",
    img1: "/detail1.png",
    img2: "/detail2.png",
    img3: "/images/sell4.png",
  },
  {
    title: "Polo with Contrast Trims",
    id: 9,
    price: "$212",
    old_price: "$242",
    img_url: "/sell1.png",
    img1: "/detail1.png",
    img2: "/detail2.png",
    img3: "/images/Frame 1.png",
  },
  {
    title: "Gradient Graphic T-shirt",
    id: 10,
    price: "$145",
    img_url: "/sell1.png",
    img1: "/detail1.png",
    img2: "/detail2.png",
    img3: "/images/Frame 2.png",
  },
  {
    title: "Polo with Tipping Details",
    id: 11,
    price: "$180",
    img_url: "/sell1.png",
    img1: "/detail1.png",
    img2: "/detail2.png",
    img3: "/images/Frame 3.png",
  },
  {
    title: "Black Striped T-shirt",
    id: 12,
    price: "$120",
    old_price: "$150",
    img_url: "/sell1.png",
    img1: "/detail1.png",
    img2: "/detail2.png",
    img3: "/images/Frame 4.png",
  },
];

export default function Pro_Detail() {
  
  const params = useParams();
  const id = params.id; //dynamic id ye se milengii
  const item = product.find((item) => item.id === Number(id));
  if (!item) {
    return <h1>Product not found</h1>;
  }

  return (
    <>
      <BreadcrumbDemo />
      <div className="flex flex-col md:flex-row justify-center sm:justify-evenly sm:mt-10 p-5 sm:p-0  max-w-screen-2xl mx-auto">
        {/* left */}
        <div className=" flex sm:flex-col  justify-between items-center w-full sm:w-[152px] order-2 sm:order-1">
          {/* images */}
          <Image
            src={item.img1}
            className=" w-[100px] sm:w-full h-[100px] sm:h-[150px]"
            alt="productdetaile"
            width={100}
            height={100}
          ></Image>
          <Image
            src={item.img2}
            className=" w-[100px] sm:w-full h-[100px] sm:h-[150px] sm:mt-3"
            alt="productdetaile"
            width={100}
            height={100}
          ></Image>
          <Image
            src={item.img3}
            className=" w-[100px] sm:w-full h-[100px] sm:h-[150px] sm:mt-3"
            alt="productdetaile"
            width={100}
            height={100}
          ></Image>
        </div>
        {/* mid div */}
        <div className="w-full sm:w-[444px] h-[260px] sm:h-[500px] mt-5 sm:mt-0 order-1 sm:order-2">
          <Image
            src={item.img3}
            alt="productdetaile"
            className="w-full h-[95%]"
            width={100}
            height={100}
          ></Image>
        </div>
        {/* right div */}
        <div className=" w-full sm:w-[600px] h-[500px] mt-3 order-3">
          <h1 className="text-2xl md:text-3xl font-bold">
           {item.title}
          </h1>
          <div className="flex text-yellow-400">
            {star.map((icon, index) => (
              <span key={index}>{icon}</span>
            ))}
          </div>
          <p className="font-bold mt-1">
            {item.price} <span>{item.old_price}</span>{" "}
          </p>
          <p>
          
          </p>
          {/* select color */}
          <div className=" mt-5">
            <p className="text-gray-500">Select Colors</p>
            <div className="flex space-x-3 mt-2">
              <div className="w-[37px] h-[37px] bg-[#4F4631] rounded-full  flex justify-center items-center">
                <Check className="text-white opacity-0  hover:opacity-100 cursor-pointer" />
              </div>
              <div className="w-[37px] h-[37px] bg-[#314F4A] rounded-full flex justify-center items-center">
                <Check className="text-white opacity-0  hover:opacity-100 cursor-pointer" />
              </div>
              <div className="w-[37px] h-[37px] bg-[#31344F] rounded-full flex justify-center items-center">
                <Check className="text-white opacity-0  hover:opacity-100 cursor-pointer" />
              </div>
            </div>
          </div>
          {/* Choose Size */}
          <div className="mt-4">
            <p className="text-gray-500">Sizes</p>
            {/* <div className="flex space-x-3 mt-2">
              <div className="w-[80px]   h-[40px] flex justify-center items-center rounded-[62px] bg-[#F0F0F0] text-gray-400 ">
                Small
              </div>
              <div className="w-[90px] h-[40px] flex justify-center items-center rounded-[62px] bg-[#F0F0F0] text-gray-400 ">
                Medium
              </div>
              <div className="w-[80px] h-[40px] flex justify-center items-center rounded-[62px] bg-[#F0F0F0] text-gray-400 ">
                Large
              </div>
              <div className="w-[90px] h-[40px] flex justify-center items-center rounded-[62px] bg-[#F0F0F0] text-gray-400 ">
                X-Large
              </div>
            </div> */}
          </div>
          {/* BTNS */}
          <div className="flex justify-start items-center mt-7 space-x-4">
            <div className="w-[100px] h-[40px] flex justify-between p-3 items-center rounded-[62px] bg-[#F0F0F0] text-gray-400 ">
              <Minus />
              1
              <Plus />
            </div>
            <a href="/cart">
              <Button className="bg-black text-white w-[300px] rounded-full">
                Add to Cart
              </Button>
            </a>
          </div>
        </div>
      </div>
      <AllReviw />
      <Tshirts />
      <Chatbot/>
    </>
  );
}
