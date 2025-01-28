import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Filter } from "lucide-react";

export function AccordionDemo() {
  const [priceRange, setPriceRange] = useState([0, 1000]); // Price range: [min, max]
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [rating, setRating] = useState<number>(0); // Rating out of 5

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prevCategories) =>
      prevCategories.includes(category)
        ? prevCategories.filter((item) => item !== category)
        : [...prevCategories, category]
    );
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newPriceRange = [...priceRange];
    newPriceRange[index] = parseInt(e.target.value);
    setPriceRange(newPriceRange);
  };

  const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRating(parseInt(e.target.value));
  };

  return (
    <div className="p-5">
      <div className="flex justify-between items-center">
        <h1 className="font-bold">Filter</h1>
        <Filter />
      </div>

      <Accordion type="single" collapsible className="w-full">
        {/* Price Range Filter */}
        <AccordionItem value="item-1">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col space-y-4">
              <div>
                <label htmlFor="minPrice" className="text-sm font-semibold">Min Price: ${priceRange[0]}</label>
                <input
                  id="minPrice"
                  type="range"
                  min="0"
                  max="1000"
                  value={priceRange[0]}
                  onChange={(e) => handlePriceChange(e, 0)}
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="maxPrice" className="text-sm font-semibold">Max Price: ${priceRange[1]}</label>
                <input
                  id="maxPrice"
                  type="range"
                  min="0"
                  max="1000"
                  value={priceRange[1]}
                  onChange={(e) => handlePriceChange(e, 1)}
                  className="w-full"
                />
              </div>
              <div className="text-sm text-gray-500">
                ${priceRange[0]} - ${priceRange[1]}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Category Filter */}
        <AccordionItem value="item-2">
          <AccordionTrigger>Categories</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col space-y-2">
              <label>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes("electronics")}
                  onChange={() => handleCategoryChange("electronics")}
                  className="mr-2"
                />
                Electronics
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes("clothing")}
                  onChange={() => handleCategoryChange("clothing")}
                  className="mr-2"
                />
                Clothing
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes("furniture")}
                  onChange={() => handleCategoryChange("furniture")}
                  className="mr-2"
                />
                Furniture
              </label>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Rating Filter */}
        <AccordionItem value="item-3">
          <AccordionTrigger>Rating</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col space-y-2">
              <label>
                <input
                  type="radio"
                  value="1"
                  checked={rating === 1}
                  onChange={handleRatingChange}
                  className="mr-2"
                />
                1 Star
              </label>
              <label>
                <input
                  type="radio"
                  value="2"
                  checked={rating === 2}
                  onChange={handleRatingChange}
                  className="mr-2"
                />
                2 Stars
              </label>
              <label>
                <input
                  type="radio"
                  value="3"
                  checked={rating === 3}
                  onChange={handleRatingChange}
                  className="mr-2"
                />
                3 Stars
              </label>
              <label>
                <input
                  type="radio"
                  value="4"
                  checked={rating === 4}
                  onChange={handleRatingChange}
                  className="mr-2"
                />
                4 Stars
              </label>
              <label>
                <input
                  type="radio"
                  value="5"
                  checked={rating === 5}
                  onChange={handleRatingChange}
                  className="mr-2"
                />
                5 Stars
              </label>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Display Selected Filters */}
      <div className="mt-4">
        <h2 className="font-semibold">Applied Filters</h2>
        <div>
          <strong>Price Range:</strong> ${priceRange[0]} - ${priceRange[1]}
        </div>
        <div>
          <strong>Categories:</strong> {selectedCategories.join(", ") || "None"}
        </div>
        <div>
          <strong>Rating:</strong> {rating > 0 ? `${rating} Stars` : "Any"}
        </div>
      </div>
    </div>
  );
}
