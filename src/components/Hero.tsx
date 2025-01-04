import Image from "next/image";

export default function Hero() {
  return (
    <main className=" max-w-screen-2xl mx-auto w-full h-full md:h-[500px] flex flex-col md:flex-row justify-between items-start bg-[#F2F0F1]">
      {/* left */}
      <div className="w-full md:w-[500px] mt-3 md:mt-10 md:ml-10 pl-3">
        {/* <h1 className="text-2xl md:text-5xl font-black text-black">FIND CLOTHES THAT MATCHES YOUR STYLE</h1> */}
        <img className="mt-7 mb-6" src="/images/Hero.png" alt="" />
        <p className="text-sm md:mt-3 text-gray-600">
          Browse through our diverse range of meticulously crafted garments,
          designed to bring out your individuality and cater to your sense of
          style.
        </p>
        <a href="casual">
          <button className="bg-black py-2 px-8 rounded-full mt-4  text-white text-sm">
            Shop Now
          </button>
        </a>
      </div>
      {/* right */}
      <div className="relative">
        <Image
          src={"/profile.png"}
          className="w-[500px] mr-4"
          width={200}
          height={200}
          alt="profile"
        ></Image>
        {/* star */}
        <Image
          src={"/star.png"}
          className="w-[50px] md:w-[100px] absolute top-[100px] left-10 md:top-[300px] md:left-[-100px]"
          width={200}
          height={200}
          alt="profile"
        ></Image>
        <Image
          src={"/star.png"}
          className=" w-[60px] md:w-[100px] absolute top-10 right-[50px] md:top-[50px] md:right-[30px]"
          width={200}
          height={200}
          alt="profile"
        ></Image>
      </div>
    </main>
  );
}
