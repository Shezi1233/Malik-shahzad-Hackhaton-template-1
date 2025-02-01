"use client"
import { ChangeEvent, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Filter } from "lucide-react";

const mockProducts = [
  { id: 1, name: "Product 1", price: 50, color: "red", size: "M" },
  { id: 2, name: "Product 2", price: 100, color: "blue", size: "L" },
  { id: 3, name: "Product 3", price: 150, color: "green", size: "S" },
  { id: 4, name: "Product 4", price: 75, color: "red", size: "XL" },
  { id: 5, name: "Product 5", price: 125, color: "blue", size: "M" },
];

export function FilterComponent() {
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);

  const handlePriceChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const newPriceRange = [...priceRange];
    newPriceRange[index] = parseInt(e.target.value);
    setPriceRange(newPriceRange);
  };

  const handleColorChange = (color: string) => {
    setSelectedColors((prevColors) =>
      prevColors.includes(color)
        ? prevColors.filter((c) => c !== color)
        : [...prevColors, color]
    );
  };

  const handleSizeChange = (size: string) => {
    setSelectedSizes((prevSizes) =>
      prevSizes.includes(size)
        ? prevSizes.filter((s) => s !== size)
        : [...prevSizes, size]
    );
  };

  const applyFilters = () => {
    const filtered = mockProducts.filter((product) => {
      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesColor =
        selectedColors.length === 0 || selectedColors.includes(product.color);
      const matchesSize =
        selectedSizes.length === 0 || selectedSizes.includes(product.size);
      return matchesPrice && matchesColor && matchesSize;
    });

    setFilteredProducts(filtered);
  };

  return (
    <div className="p-5">
      <div className="flex justify-between items-center">
        <h1 className="font-bold">Filter</h1>
        <Filter />
      </div>

      <Accordion type="single" collapsible className="w-full">
        {/* Price Range Filter */}
        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col space-y-4">
              <div>
                <label className="text-sm font-semibold">Min: ${priceRange[0]}</label>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={priceRange[0]}
                  onChange={(e) => handlePriceChange(e, 0)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-semibold">Max: ${priceRange[1]}</label>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={priceRange[1]}
                  onChange={(e) => handlePriceChange(e, 1)}
                  className="w-full"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Color Filter */}
        <AccordionItem value="color">
          <AccordionTrigger>Colors</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2">
              {["red", "blue", "green"].map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full ${
                    selectedColors.includes(color) ? "ring-2 ring-black" : ""
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Size Filter */}
        <AccordionItem value="size">
          <AccordionTrigger>Size</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2">
              {["S", "M", "L", "XL"].map((size) => (
                <button
                  key={size}
                  className={`px-3 py-1 border rounded-md ${
                    selectedSizes.includes(size) ? "bg-black text-white" : ""
                  }`}
                  onClick={() => handleSizeChange(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Apply Filters Button */}
      <button
        className="mt-4 bg-black text-white py-2 px-4 rounded"
        onClick={applyFilters}
      >
        Apply Filter
      </button>

      {/* Display Filtered Products */}
      <div className="mt-6">
        {filteredProducts.length > 0 ? (
          <ul>
            {filteredProducts.map((product) => (
              <li key={product.id} className="border-b py-2">
                {product.name} - ${product.price}
              </li>
            ))}
          </ul>
        ) : (
          <p>No products found.</p>
        )}
      </div>
    </div>
  );
}
