"use client"
import { motion } from "framer-motion";
import Image from "next/image";
import { fadeIn } from "./variants";

export default function Dress() {
  return (
    <motion.div 
      variants={fadeIn("left", 0.2)}
      initial="hidden"
      whileInView={"show"}
      viewport={{ once: false, amount: 0.7 }}
      className="w-full h-full mt-8 sm:h-[500px] bg-[#F0F0F0] flex flex-col justify-start items-center pt-8 max-w-screen-2xl mx-auto"
    >
      {/* top div */}
      <div className="mt-8 mb-5">
        {/* <h1 className="text-5xl my-6 font-black pl-6 sm:pl-0">BROWSE BY DRESS STYLE</h1> */}
        <img className="" src="/images/style.png" alt="style" />
      </div>

      {/* bottom div */}
      <div className="w-[90%] h-full sm:h-[600px] mt-5 flex flex-wrap justify-center items-center">
        {/* Image 1 */}
        <div className="w-[400px] h-[200px] m-1 relative group">
          <Image
            src={"/dreesstyle1.png"}
            className="w-full h-full rounded-[20px] group-hover:scale-105 transition-transform duration-300"
            width={100}
            height={100}
            alt="dreesstyle1"
          />
          <span className="absolute top-10 left-5 font-bold text-xl text-white group-hover:text-black transition-colors duration-300">
            Casual
          </span>
        </div>

        {/* Image 2 */}
        <div className="w-[600px] h-[200px] m-1 relative group">
          <Image
            src={"/dreesstyle2.png"}
            className="w-full h-full rounded-[20px] group-hover:scale-105 transition-transform duration-300"
            width={100}
            height={100}
            alt="dreesstyle2"
          />
          <span className="absolute top-10 left-5 font-bold text-xl text-white group-hover:text-black transition-colors duration-300">
            Formal
          </span>
        </div>

        {/* Image 3 */}
        <div className="w-[600px] h-[200px] m-1 relative group">
          <Image
            src={"/dreesstyle3.png"}
            className="w-full h-full rounded-[20px] group-hover:scale-105 transition-transform duration-300"
            width={100}
            height={100}
            alt="dreesstyle3"
          />
          <span className="absolute top-10 left-5 font-bold text-xl text-white group-hover:text-black transition-colors duration-300">
            Party
          </span>
        </div>

        {/* Image 4 */}
        <div className="w-[400px] h-[200px] m-1 relative group">
          <Image
            src={"/dreesstyle4.png"}
            className="w-full h-full rounded-[20px] group-hover:scale-105 transition-transform duration-300"
            width={100}
            height={100}
            alt="dreesstyle4"
          />
          <span className="absolute top-10 left-5 font-bold text-xl text-white group-hover:text-black transition-colors duration-300">
            Gym
          </span>
        </div>
      </div>
    </motion.div>
  );
}
