import { FaInstagram } from "react-icons/fa";
import Offers from "./offers";
import { FaFacebook, FaGithub, FaTwitter } from "react-icons/fa6";
import Image from "next/image";

export default function Footer() {
  return (
    <div className="w-full bg-[#F0F0F0]">
      <main className="w-full h-full md:h-[450px] relative mt-20 sm:mt-32 max-w-screen-2xl mx-auto">
        <div className="absolute top-[-60px] sm:top-[-80px] left-0 right-0 z-10">
          <Offers />
        </div>
        <div className="flex h-full md:h-[400px] flex-col md:flex-row justify-between items-start p-5 pt-24 sm:pt-36 border-b ">
          <div className="flex flex-col justify-center items-center w-[200px]">
            <ul>
              <h2 className="text-2xl sm:text-3xl font-black text-black my-10">SHOP.CO</h2>
              <p className="text-sm mt-1">
                We have clothes that suits your style and which you&apos;re proud to wear. From women to men.
              </p>
              <div className="flex items-center space-x-3 mt-1">
                <FaInstagram className="text-xl" />
                <FaFacebook className="text-xl" />
                <FaGithub className="text-xl" />
                <FaTwitter className="text-xl" />
              </div>
            </ul>
          </div>
          <div className="w-full md:w-[900px] grid grid-cols-2 sm:grid-cols-4 place-items-center space-y-4">
            <ul className="space-y-3">
              <h2 className="text-sm sm:text-xl">Company</h2>
              <li className="text-sm text-gray-600">About</li>
              <li className="text-sm text-gray-600">Features</li>
              <li className="text-sm text-gray-600">Work</li>
              <li className="text-sm text-gray-600">Career</li>
            </ul>
            <ul className="space-y-3">
              <h2 className="text-sm sm:text-xl">Help</h2>
              <li className="text-sm text-gray-600">Customer Support</li>
              <li className="text-sm text-gray-600">Delivery Details</li>
              <li className="text-sm text-gray-600">Terms &amp; Conditions</li>
              <li className="text-sm text-gray-600">Privacy Policy</li>
            </ul>
            <ul className="space-y-3">
              <h2 className="text-sm sm:text-xl">FAQ</h2>
              <li className="text-sm text-gray-600">Account</li>
              <li className="text-sm text-gray-600">Manage Deliveries</li>
              <li className="text-sm text-gray-600">Orders</li>
              <li className="text-sm text-gray-600">Payments</li>
            </ul>
            <ul className="space-y-3">
              <h2 className="text-sm sm:text-xl">Resources</h2>
              <li className="text-sm text-gray-600">Free eBooks</li>
              <li className="text-sm text-gray-600">Development Tutorial</li>
              <li className="text-sm text-gray-600">How to - Blog</li>
              <li className="text-sm text-gray-600">Youtube Playlist</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center mt-3 px-5 gap-4 sm:gap-0">
          <p className="text-xs sm:text-sm text-center">Shop.co &copy; 2000-2023, All Rights Reserved</p>
          <div className="flex items-center flex-wrap justify-center">
            <Image src={"/cards/visa.png"} className="w-[50px]" width={100} height={100} alt="pic" />
            <Image src={"/foot1.png"} className="w-[50px]" width={100} height={100} alt="pic" />
            <Image src={"/cards/paypal.png"} className="w-[50px]" width={100} height={100} alt="pic" />
            <Image src={"/cards/applepay.png"} className="w-[50px]" width={100} height={100} alt="pic" />
            <Image src={"/cards/badgepay.png"} className="w-[50px]" width={100} height={100} alt="pic" />
          </div>
        </div>
      </main>
    </div>
  );
}
