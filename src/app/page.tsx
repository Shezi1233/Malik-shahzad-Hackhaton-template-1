
import Fonts from "@/components/fonts";

import Hero from "@/components/Hero";
import Products, { Buttons } from "./products/page";
import Top_sell, { Buttons2 } from "./products/sell";
import Dress from "@/components/dress";
import CustomerCarousel from "@/components/couresel";



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
    </div>  
  );
}
 