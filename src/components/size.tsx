"use client";

interface SizeProps {
  selectedSizes: string[];
  onSizeChange: (size: string) => void;
}

const ALL_SIZES = ["Small", "Medium", "Large", "X-Large"];
const SIZE_MAP: Record<string, string> = {
  "Small": "S",
  "Medium": "M",
  "Large": "L",
  "X-Large": "XL",
};

export default function Size({ selectedSizes, onSizeChange }: SizeProps) {
  return (
    <div>
      <h1 className="text-xl font-bold pl-5 mt-3">Size</h1>
      <div className="flex flex-wrap gap-3 mt-2 px-5">
        {ALL_SIZES.map((label) => {
          const sizeKey = SIZE_MAP[label];
          const isSelected = selectedSizes.includes(sizeKey);
          return (
            <button
              key={label}
              onClick={() => onSizeChange(sizeKey)}
              className={`w-[90px] h-[40px] flex justify-center items-center rounded-[62px] text-sm font-medium transition-all ${
                isSelected
                  ? "bg-black text-white"
                  : "bg-[#F0F0F0] text-gray-400 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
