"use client";

import { ChangeEvent } from "react";

interface FilterComponentProps {
  priceRange: [number, number];
  selectedColors: string[];
  selectedSizes: string[];
  onPriceRangeChange: (range: [number, number]) => void;
  onColorChange: (color: string) => void;
  onSizeChange: (size: string) => void;
  onApply: () => void;
}

export function FilterComponent({
  priceRange,
  selectedColors,
  selectedSizes,
  onPriceRangeChange,
  onColorChange,
  onSizeChange,
  onApply,
}: FilterComponentProps) {
  const handleMinPrice = (e: ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    onPriceRangeChange([val, Math.max(val, priceRange[1])]);
  };

  const handleMaxPrice = (e: ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    onPriceRangeChange([Math.min(priceRange[0], val), val]);
  };

  const colors = [
    { name: "Red", hex: "#4F4631" },
    { name: "Teal", hex: "#314F4A" },
    { name: "Navy", hex: "#31344F" },
  ];

  const sizes = ["S", "M", "L", "XL"];

  return (
    <div className="p-5">
      <h1 className="font-bold text-xl mb-6">Filter</h1>

      {/* Price Range */}
      <div className="mb-6">
        <h2 className="font-semibold text-lg mb-3">Price Range</h2>
        <div className="flex flex-col space-y-4 px-1">
          <div>
            <label className="text-sm text-gray-500">Min: ${priceRange[0]}</label>
            <input
              type="range"
              min="0"
              max="300"
              step="5"
              value={priceRange[0]}
              onChange={handleMinPrice}
              className="w-full accent-black"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500">Max: ${priceRange[1]}</label>
            <input
              type="range"
              min="0"
              max="300"
              step="5"
              value={priceRange[1]}
              onChange={handleMaxPrice}
              className="w-full accent-black"
            />
          </div>
          <div className="flex justify-between text-sm font-medium mt-1">
            <span className="bg-gray-100 px-3 py-1 rounded-full">${priceRange[0]}</span>
            <span className="bg-gray-100 px-3 py-1 rounded-full">${priceRange[1]}</span>
          </div>
        </div>
      </div>

      <hr className="my-4" />

      {/* Colors */}
      <div className="mb-6">
        <h2 className="font-semibold text-lg mb-3">Colors</h2>
        <div className="flex flex-wrap gap-3">
          {colors.map((color) => (
            <button
              key={color.hex}
              title={color.name}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                selectedColors.includes(color.hex)
                  ? "border-black scale-110"
                  : "border-transparent hover:scale-105"
              }`}
              style={{ backgroundColor: color.hex }}
              onClick={() => onColorChange(color.hex)}
            />
          ))}
        </div>
        {selectedColors.length > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            {selectedColors.length} selected
          </p>
        )}
      </div>

      <hr className="my-4" />

      {/* Sizes */}
      <div className="mb-6">
        <h2 className="font-semibold text-lg mb-3">Size</h2>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              className={`px-5 py-2 rounded-[62px] text-sm font-medium transition-all ${
                selectedSizes.includes(size)
                  ? "bg-black text-white"
                  : "bg-[#F0F0F0] text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => onSizeChange(size)}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Apply Button */}
      <button
        className="w-full mt-2 bg-black text-white py-3 px-4 rounded-full font-medium hover:bg-gray-800 transition-colors"
        onClick={onApply}
      >
        Apply Filter
      </button>
    </div>
  );
}
