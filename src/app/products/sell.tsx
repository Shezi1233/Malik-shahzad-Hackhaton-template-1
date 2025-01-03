import Image from "next/image";
import Link from "next/link";
import { FaStar } from "react-icons/fa";

interface Iproducts{
    title:string,
    price:string,
    id:number
    rating?:string,
    old_price?:string
    img_url:string
}

let product:Iproducts[] = [
    {
     title:"VERTICAL STRIPED SHIRT",
     id:5,
     price:"$212",
     img_url:"/images/sell.png",
     old_price:"223"
    },
    {
     title:"COURAGE GRAPHIC T-SHIRT",
     id:6,
     price:"$145",
     img_url:"/images/sell2.png",
     
    },
    {
     title:"LOOSE FIT BERMUDA SHORTS",
     id:7,
     price:"$80",
     img_url:"/images/sell3.png"
    },
    {
     title:"FADED SKINNY JEANS",
     id:8,
     price:"$210",
     img_url:"/images/sell4.png",
     

    }
]

// Adding key prop in star array
let star = [
    <FaStar key={1} />,
    <FaStar key={2} />,
    <FaStar key={3} />,
    <FaStar key={4} />,
    <FaStar key={5} />,
];
export default function Top_sell(){
    return(
        <div className="w-full h-full sm:h-[500px] mt-10">
            {/* <h1 className="text-3xl md:text-5xl font-black text-black text-center">TOP SELLING</h1> */}
            <div className="flex justify-center items-center mt-8">
            <img className="mt-12" src="/images/top.png" alt="NEW ARRIVALS" />
            </div>
            <div className="flex flex-col md:flex-row justify-center items-center md:justify-between px-8 mt-10">
                {
                    product.map((data)=>{
                        return(
                              <div key={data.id}>
                                 <Link href={`/products/${data.id}`}>
                                 <div className="w-[230px] h-[230px] bg-[#F0EEED] rounded-[20px]">
                                  <Image src={data.img_url} alt={data.title}
                                  className="w-full h-full rounded-[20px]"
                                 width={100} height={100}></Image>
                                 
                                  </div>
                                 </Link>
                                <div>
                                <p className="text-lg mt-2 font-bold">{data.title}</p>
                                <div className="flex text-yellow-400">
                                    {star.map((icon, index) => (
                                        <span key={index}>{icon}</span>
                                    ))}
                                </div>
                                <p  className="font-bold mt-1">{data.price} <span className="text-gray-400 font-bold line-through"> {data.old_price} </span></p>
                                </div>
                              </div>
                        )
                    })
                }
            </div>
        </div>
    )
}


export const Buttons2= () => {
    return (
      <div className="flex justify-center items-center mt-10">
            <button className="">View All</button>
      </div>
    )
  }
  