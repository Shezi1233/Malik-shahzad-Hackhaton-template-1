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
    title: "T-SHIRT WITH TAPE DETAILS",
    id: 1,
    price: "$120",
    img_url: "/product1.png",
  },
  {
    title: "SKINNY FIT JEANS",
    id: 1,
    price: "$120",
    img_url: "/product2.png",
    old_price: "$200",
  },
  {
    title: "T-SHIRT WITH TAPE DETAILS",
    id: 1,
    price: "$120",
    img_url: "/product3.png",
  },
  {
    title: "SKINNY FIT JEANS",
    id: 1,
    price: "$120",
    img_url: "/images/sell.png",
    old_price: "$200",
  },
  {
    title: "T-SHIRT WITH TAPE DETAILS",
    id: 1,
    price: "$120",
    img_url: "/images/sell2.png",
  },
  {
    title: "SKINNY FIT JEANS",
    id: 1,
    price: "$120",
    img_url: "/images/sell3.png",
    old_price: "$200",
  },
  {
    title: "T-SHIRT WITH TAPE DETAILS",
    id: 1,
    price: "$120",
    img_url: "/images/Frame 1.png",
  },

  {
    title: "CHECKERED SHIRT",
    id: 1,
    price: "$120",
    img_url: "/images/Frame 2.png",
  },
  {
    title: "SLEEVE STRIPED T-SHIRT",
    id: 1,
    price: "$120",
    img_url: "/images/Frame 3.png",
    old_price: "$200",
  },
];
// Adding key prop in star array
let star = [
  <FaStar key={1} />,
  <FaStar key={2} />,
  <FaStar key={3} />,
  <FaStar key={4} />,
  <FaStar key={5} />,
];

export default function CasualShirts() {
  return (
    <div className="w-full h-full sm:h-[500px] mt-10">
      <h1 className="text-3xl md:text-5xl font-black text-black text-center">
        NEW ARRIVALS
      </h1>
      <div className="flex flex-wrap flex-col md:flex-row justify-center items-center md:justify-between px-8 mt-10">
        {product.map((data) => {
          return (
            <div key={data.id}>
              <Link href={`/products/${data.id}`}>
                <div className="w-[230px] h-[230px] bg-[#F0EEED] rounded-[20px]">
                  <Image
                    src={data.img_url}
                    alt={data.title}
                    className="w-full h-full rounded-[20px]"
                    width={100}
                    height={100}
                  ></Image>
                </div>
              </Link>
              <div>
                <p className="text-lg mt-2 font-bold">{data.title}</p>
                <div className="flex text-yellow-400">
                  {star.map((icon, index) => (
                    <span key={index}>{icon}</span>
                  ))}
                </div>
                <p className="font-bold mt-1">
                  {data.price}{" "}
                  <span className="text-gray-400 font-bold line-through">
                    {" "}
                    {data.old_price}{" "}
                  </span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
