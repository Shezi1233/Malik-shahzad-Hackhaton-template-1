"use client"
import { motion } from "framer-motion";
import { MdOutlineEmail } from "react-icons/md";
import { fadeIn } from "./variants";

export default function Offers() {
  return (
    <main className="w-full flex justify-center items-center  max-w-screen-2xl mx-auto">
      <motion.div 
       variants={fadeIn("down", 0.2)}
              initial="hidden"
              whileInView={"show"}
              viewport={{ once: false, amount: 0.7 }}
      
      className="w-[95%] sm:w-[80%] h-full sm:h-[150px] bg-black text-white flex flex-col sm:flex-row items-center p-4 sm:p-5 gap-4 sm:gap-0 rounded-[20px] ">
        <h1 className="text-xl sm:text-4xl font-extrabold text-center sm:text-left leading-tight">
          STAY UPTO DATE ABOUT OUR LATEST OFFERS
        </h1>
        <div className="space-y-3 w-full sm:w-auto">
          <div className="flex justify-start items-center w-full sm:w-[330px] h-[40px] rounded-[62px] bg-[#F0F0F0]">
            <MdOutlineEmail className="text-xl ml-2 text-black" />
            <input
              placeholder="Enter your email..."
              className="w-full ml-2 outline-none h-full rounded-[62px] bg-[#F0F0F0] text-sm text-black"
            ></input>
          </div>
          <div className="flex justify-center items-center w-full sm:w-[330px] h-[40px] rounded-[62px] bg-white cursor-pointer hover:bg-gray-200 transition-colors">
            <p className="text-black text-sm font-medium">Subscribe to Newsletter</p>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
