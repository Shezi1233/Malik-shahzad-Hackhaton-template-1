"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const COLOR_MAP: { name: string; hex: string; bg: string }[] = [
  { name: "Red", hex: "#4F4631", bg: "bg-[#4F4631]" },
  { name: "Teal", hex: "#314F4A", bg: "bg-[#314F4A]" },
  { name: "Navy", hex: "#31344F", bg: "bg-[#31344F]" },
  { name: "Yellow", hex: "#E5A93D", bg: "bg-[#E5A93D]" },
  { name: "Purple", hex: "#7C3AED", bg: "bg-[#7C3AED]" },
  { name: "Pink", hex: "#EC4899", bg: "bg-[#EC4899]" },
  { name: "Orange", hex: "#F97316", bg: "bg-[#F97316]" },
  { name: "Teal", hex: "#14B8A6", bg: "bg-[#14B8A6]" },
  { name: "Cyan", hex: "#06B6D4", bg: "bg-[#06B6D4]" },
  { name: "Black", hex: "#000000", bg: "bg-black" },
];

interface CheckboxDemoProps {
  selectedColors: string[];
  onColorChange: (color: string) => void;
}

export function CheckboxDemo({ selectedColors, onColorChange }: CheckboxDemoProps) {
  return (
    <div>
      <h1 className="text-xl font-bold pl-5">Colors</h1>
      <div className="flex flex-wrap gap-1 px-5 mt-2">
        {COLOR_MAP.map((color, index) => {
          const isSelected = selectedColors.includes(color.hex);
          return (
            <div key={index} className="flex items-center space-x-2">
              <Checkbox
                id={`checkbox-${index}`}
                checked={isSelected}
                onCheckedChange={() => onColorChange(color.hex)}
                className={cn(
                  "h-[37px] w-[37px] rounded-full border-2",
                  color.bg,
                  isSelected ? "border-black scale-110" : "border-gray-300"
                )}
              />
              <label
                htmlFor={`checkbox-${index}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              ></label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
