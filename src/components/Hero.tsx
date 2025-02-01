"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { fadeIn } from "./variants";

export default function Hero() {
  return (
    <main className="max-w-screen-2xl mx-auto w-full h-full md:h-[500px] flex flex-col md:flex-row justify-between items-start bg-[#F2F0F1]">
      {/* left */}
      <motion.div
        variants={fadeIn("up", 0.2)}
        initial="hidden"
        whileInView={"show"}
        viewport={{ once: false, amount: 0.7 }}
        className="w-full md:w-[500px] mt-3 md:mt-10 md:ml-10 pl-3"
      >
        <img className="mt-7 mb-6" src="/images/Hero.png" alt="" />
        <p className="text-sm md:mt-3 text-gray-600">
          Browse through our diverse range of meticulously crafted garments,
          designed to bring out your individuality and cater to your sense of
          style.
        </p>
        <a href="casual">
          <button className="bg-black py-2 px-8 rounded-full mt-4 text-white text-sm">
            Shop Now
          </button>
        </a>
        <div className="flex justify-between mt-6 gap-4 ">
          <div className="text-gray-800 font-normal">
            <span className="text-4xl md:text-5xl">200+</span>
            <span className="text-sm block">International Brands</span>
          </div>
          <div className="text-gray-800 font-normal">
            <span className="text-4xl md:text-5xl">2,000+</span>
            <span className="text-sm block">High-Quality Products</span>
          </div>
          <div className="text-gray-800 font-normal">
            <span className="text-4xl md:text-5xl">30,000+</span>
            <span className="text-sm block">Happy Customers</span>
          </div>
        </div>
      </motion.div>
      {/* right */}
      <motion.div
        variants={fadeIn("down", 0.2)}
        initial="hidden"
        whileInView={"show"}
        viewport={{ once: false, amount: 0.7 }}
        className="relative"
      >
        <Image
          src={"/profile.png"}
          className="w-[500px] mr-4"
          width={200}
          height={200}
          alt="profile"
        ></Image>
        {/* Rotating stars */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: 5,
            ease: "linear",
          }}
          className="absolute"
          style={{ top: "100px", left: "10px" }}
        >
          <Image
            src={"/star.png"}
            className=" w-[50px] md:w-[100px]"
            width={200}
            height={200}
            alt="rotating star"
          />
        </motion.div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: 5,
            ease: "linear",
          }}
          className="absolute"
          style={{ top: "10px", right: "50px" }}
        >
          <Image
            src={"/star.png"}
            className="w-[60px] md:w-[100px]"
            width={200}
            height={200}
            alt="rotating star"
          />
        </motion.div>
      </motion.div>
    </main>
  );
}
