import Image from "next/image";

export default function Dress() {
  return (
    <div className="w-full h-full mt-8  sm:h-[500px] bg-[#F0F0F0] flex flex-col  justify-start items-center pt-8  max-w-screen-2xl mx-auto">
      {/* top div */}
      <div className="mt-8 mb-5">
        {/* <h1 className="text-5xl  my-6 font-black pl-6 sm:pl-0">BROWSE BY DRESS STYLE</h1> */}
        <img className="" src="/images/style.png" alt="style" />
      </div>
      {/* bottom div */}
      <div className=" w-[90%] h-full sm:h-[600px] mt-5 flex flex-wrap justify-center items-center">
        <div className="w-[400px] h-[200px] m-1 relative">
          <Image
            src={"/dreesstyle1.png"}
            className="w-full h-full rounded-[20px]"
            width={100}
            height={100}
            alt="dreesstyle1"
          ></Image>
          <span className="absolute top-10 left-5 font-bold text-xl">
            Casual
          </span>
        </div>
        <div className="w-[600px] h-[200px] m-1 relative">
          <Image
            src={"/dreesstyle2.png"}
            className="w-full h-full rounded-[20px]"
            width={100}
            height={100}
            alt="dreesstyle1"
          ></Image>
          <span className="absolute top-10 left-5 font-bold text-xl">
            Formal
          </span>
        </div>
        <div className="w-[600px] h-[200px] m-1 relative">
          <Image
            src={"/dreesstyle3.png"}
            className="w-full h-full rounded-[20px]"
            width={100}
            height={100}
            alt="dreesstyle1"
          ></Image>
          <span className="absolute top-10 left-5 font-bold text-xl">
            Party
          </span>
        </div>
        <div className="w-[400px] h-[200px] m-1 relative">
          <Image
            src={"/dreesstyle4.png"}
            className="w-full h-full rounded-[20px]"
            width={100}
            height={100}
            alt="dreesstyle1"
          ></Image>
          <span className="absolute top-10 left-5 font-bold text-xl">Gym</span>
        </div>
      </div>
    </div>
  );
}
