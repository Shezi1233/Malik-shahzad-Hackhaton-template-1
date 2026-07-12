"use client";
import { FilterComponent } from "@/components/accordion";
import { CheckboxDemo } from "@/components/checkbox";
import CasualShirts from "@/components/shirts";
import Size from "@/components/size";
import { SliderDemo } from "@/components/slider";

function DressStyleFilter() {
  const styles = ["Casual", "Formal", "Sporty", "Boho", "Minimalist"];

  return (
    <div className="px-5 mt-4">
      <h1 className="text-xl font-bold mb-3">Dress Style</h1>
      <div className="flex flex-wrap gap-2">
        {styles.map((style) => (
          <button
            key={style}
            className="px-4 py-2 rounded-[62px] bg-[#F0F0F0] text-gray-500 text-sm hover:bg-gray-200 transition-colors"
          >
            {style}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Casual() {
  return (
    <main className="flex flex-col sm:flex-row justify-center items-start space-x-6 px-4 mt-6">
      {/* left sidebar */}
      <div className="w-full md:w-[295px] border rounded-[16px] p-4">
        <FilterComponent />
        <SliderDemo />
        <CheckboxDemo />
        <Size />
        <DressStyleFilter />
      </div>
      {/* right content */}
      <div className="w-full md:w-[900px]">
        <CasualShirts />
      </div>
    </main>
  );
}
