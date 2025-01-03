import { FaInstagram } from "react-icons/fa";
import Offers from "./offers";
import { FaFacebook, FaGithub, FaTwitter } from "react-icons/fa6";
import { Images } from "lucide-react";
import Image from "next/image";

export default function Footer(){
    return (
        <main className="bg-[#F0F0F0] w-full h-full md:h-[450px] relative mt-32  max-w-screen-2xl mx-auto">
          {/*  */}
          <span className="absolute top-[-80px]">
          <Offers/>
          </span>
        {/* container */}
        <div  className="flex h-full md:h-[400px] flex-col md:flex-row justify-between items-start p-5 pt-[160px] sm:pt-32 border-b ">
          {/* top div */}
          <div className="flex flex-col justify-center items-center w-[200px]"> 
            <ul>
                <h2 className="text-2xl sm:text-3xl font-black text-black my-10">SHOP.CO</h2>
                <p className="text-sm mt-1 "> We have clothes that suits your style and which you’re proud to wear. From women to men.</p>
                   {/* icon */}
                   <div className="flex items-center space-x-3 mt-1">
                    <FaInstagram className="text-xl"/>
                     <FaFacebook className="text-xl"/>
                       <FaGithub className="text-xl"/>
                      <FaTwitter className="text-xl"/>
                   </div>
            </ul>
          </div>
          {/* mid div */}
          <div className="w-full md:w-[900px] grid grid-cols-2 sm:grid-cols-4 place-items-center space-y-4">
              {/* box 1 */}
              
                 <ul className="space-y-3 ">
                   <h2 className="text-sm sm:text-xl">Company</h2>
                   <li  className="text-sm text-gray-600">About</li>
                   <li  className="text-sm text-gray-600">Features</li>
                   <li  className="text-sm text-gray-600">Work</li>
                   <li  className="text-sm text-gray-600">Career</li>
                   </ul>
                {/* box 2 */}
                <ul className="space-y-3">
                   <h2 className="text-sm sm:text-xl">Help</h2>
                   <li  className="text-sm text-gray-600">Customer Support</li>
                   <li  className="text-sm text-gray-600">Delivery Details</li>
                   <li  className="text-sm text-gray-600">Terms & Conditions</li>
                   <li  className="text-sm text-gray-600">Privacy Policy</li>
                   </ul>
                {/* box 3*/}
                <ul className="space-y-3">
                   <h2 className="text-sm sm:text-xl">FAQ</h2>
                   <li  className="text-sm text-gray-600">Account</li>
                   <li  className="text-sm text-gray-600">Manage Deliveries</li>
                   <li  className="text-sm text-gray-600">Orders</li>
                   <li  className="text-sm text-gray-600">Payments</li>
                   </ul>
                   {/* box 4 */}

                   <ul className="space-y-3">
                   <h2 className="text-sm sm:text-xl">Resources</h2>
                   <li  className="text-sm text-gray-600">Free eBooks</li>
                   <li  className="text-sm text-gray-600">Development Tutorial</li>
                   <li  className="text-sm text-gray-600">How to - Blog</li>
                   <li  className="text-sm text-gray-600">Youtube Playlist</li>
                   </ul>
                   </div>
                {/* box 4 */}
                {/* complete boxes*/}
        </div>
         {/* bottom div */}
         <div className="flex flex-col sm:flex-row justify-between items-center mt-3">
                <p className="text-sm">Shop.co © 2000-2023, All Rights Reserved</p>
                <div className="flex items-center -my-10 ml-10">
                    <Image src={"/cards/visa.png"} className="w-[50px]" width={100} height={100} alt="pic"/>
                    <Image src={"/foot1.png"} className="w-[50px]" width={100} height={100} alt="pic"/>
                    <Image src={"/cards/paypal.png"} className="w-[50px]" width={100} height={100} alt="pic"/>
                    <Image src={"/cards/applepay.png"} className="w-[50px]" width={100} height={100} alt="pic"/>
                    <Image src={"/cards/badgepay.png"} className="w-[50px]" width={100} height={100} alt="pic"/>
                </div>
            </div>
        </main>
    )
}