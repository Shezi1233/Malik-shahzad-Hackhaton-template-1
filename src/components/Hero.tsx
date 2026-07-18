"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { fadeIn } from "./variants";

export default function Hero() {
  return (
    <div className="w-full bg-[#F2F0F1]">
      <main className="max-w-screen-2xl mx-auto w-full h-full md:h-[500px] flex flex-col md:flex-row justify-between items-start overflow-hidden relative">
        {/* Left Section */}
        <motion.div
          variants={fadeIn("up", 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.7 }}
          className="w-full md:max-w-[50%] mt-3 md:mt-10 md:ml-10 px-4 md:px-6"
        >
          <Image
            className="mt-4 sm:mt-7 mb-4 sm:mb-6 max-w-full h-auto"
            src="/images/Hero.png"
            alt="Hero"
            width={600}
            height={200}
            priority
          />
          <p className="text-xs sm:text-sm md:mt-3 text-gray-600 leading-relaxed">
            Browse through our diverse range of meticulously crafted garments,
            designed to bring out your individuality and cater to your sense of
            style.
          </p>
          <a href="/casual">
            <button className="bg-black py-2 sm:py-3 px-6 sm:px-8 rounded-full mt-4 text-white text-xs sm:text-sm w-full sm:w-auto">
              Shop Now
            </button>
          </a>
          {/* Responsive Statistics Section */}
          <div className="flex flex-row md:flex-row justify-around md:justify-between gap-2 md:gap-4 mt-6 md:mt-8 w-full">
            <div className="text-gray-800 font-normal text-center md:text-left">
              <span className="text-2xl md:text-5xl">200+</span>
              <span className="text-[10px] sm:text-sm block">International Brands</span>
            </div>
            <div className="text-gray-800 font-normal text-center md:text-left">
              <span className="text-2xl md:text-5xl">2,000+</span>
              <span className="text-[10px] sm:text-sm block">High-Quality Products</span>
            </div>
            <div className="text-gray-800 font-normal text-center md:text-left">
              <span className="text-2xl md:text-5xl">30,000+</span>
              <span className="text-[10px] sm:text-sm block">Happy Customers</span>
            </div>
          </div>
        </motion.div>

        {/* Right Section */}
        <motion.div
          variants={fadeIn("down", 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.7 }}
          className="relative w-full md:w-auto mt-6 md:mt-0 flex justify-center"
        >
          <Image
            src="/profile.png"
            className="w-full max-w-[400px] sm:max-w-full md:w-[500px] h-auto"
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
            className="absolute top-[60px] left-[5px] sm:top-[100px] sm:left-[10px]"
          >
            <Image
              src="/star.png"
              className="w-[40px] sm:w-[100px]"
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
            className="absolute top-[5px] right-[20px] sm:top-[10px] sm:right-[50px]"
          >
            <Image
              src="/star.png"
              className="w-[40px] sm:w-[100px]"
              width={100}
              height={100}
              alt="rotating star"
            />
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
