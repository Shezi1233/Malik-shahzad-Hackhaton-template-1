
import Fonts from "@/components/fonts";

import Hero from "@/components/Hero";
import Products  from "./products/page";
import Top_sell from "./products/sell";
import Dress from "@/components/dress";
import CustomerCarousel from "@/components/couresel";
import { Buttons, Buttons2 } from "@/components/buttons";
import Chatbot from "@/components/chatbot";



export default function Home() {
  return (
    <div >
       
       <Hero/>
       <Fonts/>
       <Products/>
       <Buttons/>
       <Top_sell/>
       <Buttons2/>
       <Dress/>
       <CustomerCarousel/>
       <Chatbot/>
    </div>  
  );
}
 