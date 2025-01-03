import { MdOutlineEmail } from "react-icons/md";
import { FaSearchengin } from "react-icons/fa6";

export default function Offers(){
    return(
        <main className="w-full flex justify-center items-center  max-w-screen-2xl mx-auto">
            <div className="w-[80%] h-full sm:h-[150px] bg-black text-white flex flex-col sm:flex-row items-center p-5 rounded-[20px] ">
               <h1 className="text-2xl sm:text-4xl font-extrabold">STAY UPTO DATE ABOUT OUR LATEST OFFERS</h1>
               <div className="space-y-3">
                      <div className="flex  justify-start items-center sm:w-[330px] h-[40px] rounded-[62px] bg-[#F0F0F0]">
                          <MdOutlineEmail className="text-xl ml-2 text-black"/>
                          <input placeholder="search item..." className="w-full ml-2 outline-none h-full rounded-[62px]   bg-[#F0F0F0] "></input>
                       </div>
                       <div className="flex  justify-center items-center sm:w-[330px] h-[40px] rounded-[62px] bg-[#F0F0F0]">
                         <p className="text-black">Subscribe to Newsletter</p>
                       </div>

               </div>
            </div>
        </main>
    )
}