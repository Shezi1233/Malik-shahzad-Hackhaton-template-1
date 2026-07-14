"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

interface SliderDemoProps {
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  min?: number;
  max?: number;
}

export function SliderDemo({
  priceRange,
  onPriceRangeChange,
  min = 0,
  max = 300,
}: SliderDemoProps) {
  return (
    <div className="px-5">
      <h1 className="font-bold mb-4">Price</h1>
      {/* Custom dual-handle range slider */}
      <div className="relative h-2 bg-gray-200 rounded-full mt-6">
        {/* Track fill */}
        <div
          className="absolute h-full bg-black rounded-full"
          style={{
            left: `${((priceRange[0] - min) / (max - min)) * 100}%`,
            width: `${((priceRange[1] - priceRange[0]) / (max - min)) * 100}%`,
          }}
        />
        {/* Min thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={5}
          value={priceRange[0]}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            onPriceRangeChange([Math.min(val, priceRange[1]), priceRange[1]]);
          }}
          className="absolute top-0 w-full h-full opacity-0 cursor-pointer z-10"
          style={{ pointerEvents: "auto" }}
        />
        {/* Max thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={5}
          value={priceRange[1]}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            onPriceRangeChange([priceRange[0], Math.max(val, priceRange[0])]);
          }}
          className="absolute top-0 w-full h-full opacity-0 cursor-pointer z-20"
          style={{ pointerEvents: "auto" }}
        />
        {/* Min thumb visual */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-black rounded-full border-2 border-white shadow-md z-10 pointer-events-none"
          style={{
            left: `calc(${((priceRange[0] - min) / (max - min)) * 100}% - 10px)`,
          }}
        />
        {/* Max thumb visual */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-black rounded-full border-2 border-white shadow-md z-10 pointer-events-none"
          style={{
            left: `calc(${((priceRange[1] - min) / (max - min)) * 100}% - 10px)`,
          }}
        />
      </div>
      <div className="flex justify-between items-center mt-3">
        <span className="font-bold text-sm">${priceRange[0]}</span>
        <span className="font-bold text-sm">${priceRange[1]}</span>
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>${min}</span>
        <span>${max}</span>
      </div>
    </div>
  );
}
