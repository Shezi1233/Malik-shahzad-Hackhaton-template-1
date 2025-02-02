"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { fadeIn } from "./variants";

export default function Hero() {
  return (
    <main className="max-w-screen-2xl mx-auto w-full h-full md:h-[500px] flex flex-col md:flex-row justify-between items-start bg-[#F2F0F1] overflow-hidden relative">
      {/* Left Section */}
      <motion.div
        variants={fadeIn("up", 0.2)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.7 }}
        className="w-full md:max-w-[50%] mt-3 md:mt-10 md:ml-10 px-4 md:px-6"
      >
        <img
          className="mt-7 mb-6 max-w-full"
          src="/images/Hero.png"
          alt="Hero"
        />
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
        {/* Responsive Statistics Section */}
        <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-4 mt-6 md:mt-8">
          <div className="text-gray-800 font-normal text-center md:text-left">
            <span className="text-4xl md:text-5xl">200+</span>
            <span className="text-sm block">International Brands</span>
          </div>
          <div className="text-gray-800 font-normal text-center md:text-left">
            <span className="text-4xl md:text-5xl">2,000+</span>
            <span className="text-sm block">High-Quality Products</span>
          </div>
          <div className="text-gray-800 font-normal text-center md:text-left">
            <span className="text-4xl md:text-5xl">30,000+</span>
            <span className="text-sm block">Happy Customers</span>
          </div>
        </div>
      </motion.div>

      {/* Right Section */}
      <motion.div
        variants={fadeIn("down", 0.2)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.7 }}
        className="relative w-full md:w-auto mt-8 md:mt-0 flex justify-center"
      >
        <Image
          src="/profile.png"
          className="max-w-full md:w-[500px]"
          width={500}
          height={500}
          alt="profile"
        />
        {/* Rotating Stars */}
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
            src="/star.png"
            className="w-[50px] md:w-[100px]"
            width={100}
            height={100}
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
            src="/star.png"
            className="w-[60px] md:w-[100px]"
            width={100}
            height={100}
            alt="rotating star"
          />
        </motion.div>
      </motion.div>
    </main>
  );
}
