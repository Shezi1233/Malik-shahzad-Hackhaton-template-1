"use client";
import { useState, useCallback, useMemo } from "react";
import { FilterComponent } from "@/components/accordion";
import { CheckboxDemo } from "@/components/checkbox";
import CasualShirts from "@/components/shirts";
import Size from "@/components/size";
import { SliderDemo } from "@/components/slider";

function DressStyleFilter({
  selectedStyle,
  onStyleChange,
}: {
  selectedStyle: string;
  onStyleChange: (style: string) => void;
}) {
  const styles = ["Casual", "Formal", "Sporty", "Boho", "Minimalist"];

  return (
    <div className="px-5 mt-4">
      <h1 className="text-xl font-bold mb-3">Dress Style</h1>
      <div className="flex flex-wrap gap-2">
        {styles.map((style) => {
          const isSelected = selectedStyle === style;
          return (
            <button
              key={style}
              onClick={() => onStyleChange(isSelected ? "" : style)}
              className={`px-4 py-2 rounded-[62px] text-sm font-medium transition-all ${
                isSelected
                  ? "bg-black text-white"
                  : "bg-[#F0F0F0] text-gray-500 hover:bg-gray-200"
              }`}
            >
              {style}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Casual() {
  // ── Unified filter state ──
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 300]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [productCount, setProductCount] = useState<number>(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // ── Applied filters (what the API actually uses) ──
  const [appliedFilters, setAppliedFilters] = useState<{
    min_price?: number;
    max_price?: number;
    sizes?: string;
    colors?: string;
    category?: string;
  }>({});

  // ── Handlers ──
  const handleColorChange = useCallback((color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  }, []);

  const handleSizeChange = useCallback((size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  }, []);

  const handleApply = useCallback(() => {
    const filters: typeof appliedFilters = {};

    if (priceRange[0] > 0) filters.min_price = priceRange[0];
    if (priceRange[1] < 300) filters.max_price = priceRange[1];

    if (selectedSizes.length > 0) {
      filters.sizes = selectedSizes.join(",");
    }

    if (selectedColors.length > 0) {
      filters.colors = selectedColors.join(",");
    }

    if (selectedStyle) {
      // Map display style to backend category
      const styleMap: Record<string, string> = {
        Casual: "new_arrivals",
        Formal: "top_selling",
        Sporty: "you_might_also_like",
      };
      filters.category = styleMap[selectedStyle] || selectedStyle.toLowerCase();
    }

    setAppliedFilters(filters);
  }, [priceRange, selectedSizes, selectedColors, selectedStyle]);

  // ── Color & size handler for sidebar + duplicated components ──
  // (checkbox.tsx and size.tsx are extras on the page; sync them)

  const hasActiveFilters = useMemo(
    () =>
      priceRange[0] > 0 ||
      priceRange[1] < 300 ||
      selectedSizes.length > 0 ||
      selectedColors.length > 0 ||
      selectedStyle !== "",
    [priceRange, selectedSizes, selectedColors, selectedStyle]
  );

  const clearFilters = useCallback(() => {
    setPriceRange([0, 300]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedStyle("");
    setAppliedFilters({});
  }, []);

  return (
    <main className="flex flex-col md:flex-row justify-center items-start md:space-x-6 px-4 mt-6 relative">
      {/* Mobile Filter Toggle Button */}
      <button
        onClick={() => setMobileFiltersOpen(true)}
        className="md:hidden w-full bg-black text-white py-3 rounded-full font-medium mb-4 flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filters &amp; Sorting
      </button>

      {/* Mobile Filter Overlay */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileFiltersOpen(false)}
          />
          {/* Sidebar Panel */}
          <div className="absolute right-0 top-0 h-full w-[85vw] max-w-[360px] bg-white shadow-xl overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
              <h1 className="font-bold text-xl">Filters</h1>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-500 underline hover:text-black"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <FilterComponent
                priceRange={priceRange}
                selectedColors={selectedColors}
                selectedSizes={selectedSizes}
                onPriceRangeChange={setPriceRange}
                onColorChange={handleColorChange}
                onSizeChange={handleSizeChange}
                onApply={() => { handleApply(); setMobileFiltersOpen(false); }}
              />
              <hr className="my-3" />
              <SliderDemo
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
              />
              <hr className="my-3" />
              <CheckboxDemo
                selectedColors={selectedColors}
                onColorChange={handleColorChange}
              />
              <hr className="my-3" />
              <Size
                selectedSizes={selectedSizes}
                onSizeChange={handleSizeChange}
              />
              <hr className="my-3" />
              <DressStyleFilter
                selectedStyle={selectedStyle}
                onStyleChange={setSelectedStyle}
              />
              <div className="mt-4">
                <button
                  onClick={() => { handleApply(); setMobileFiltersOpen(false); }}
                  className="w-full bg-black text-white py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
                >
                  Apply Filters {hasActiveFilters ? `(${productCount || "..."})` : ""}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* left sidebar - desktop only */}
      <div className="hidden md:block md:w-[295px] border rounded-[16px] p-4">
        <div className="flex items-center justify-between mb-2 px-5 pt-2">
          <h1 className="font-bold text-xl">Filters</h1>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 underline hover:text-black"
            >
              Clear all
            </button>
          )}
        </div>

        <FilterComponent
          priceRange={priceRange}
          selectedColors={selectedColors}
          selectedSizes={selectedSizes}
          onPriceRangeChange={setPriceRange}
          onColorChange={handleColorChange}
          onSizeChange={handleSizeChange}
          onApply={handleApply}
        />

        <hr className="my-3" />
        <SliderDemo
          priceRange={priceRange}
          onPriceRangeChange={setPriceRange}
        />

        <hr className="my-3" />
        <CheckboxDemo
          selectedColors={selectedColors}
          onColorChange={handleColorChange}
        />

        <hr className="my-3" />
        <Size
          selectedSizes={selectedSizes}
          onSizeChange={handleSizeChange}
        />

        <hr className="my-3" />
        <DressStyleFilter
          selectedStyle={selectedStyle}
          onStyleChange={setSelectedStyle}
        />

        {/* Bottom Apply Button */}
        <div className="px-5 mt-4">
          <button
            onClick={handleApply}
            className="w-full bg-black text-white py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
          >
            Apply Filters {hasActiveFilters ? `(${productCount || "..."})` : ""}
          </button>
        </div>
      </div>

      {/* right content */}
      <div className="w-full md:w-[900px]">
        <div className="flex items-center justify-between mb-4 px-4">
          <h2 className="text-lg font-semibold">
            {productCount > 0
              ? `${productCount} Product${productCount > 1 ? "s" : ""} Found`
              : "All Products"}
          </h2>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 underline hover:text-black"
            >
              Reset
            </button>
          )}
        </div>
        <CasualShirts
          filters={appliedFilters}
          onTotalChange={setProductCount}
        />
      </div>
    </main>
  );
}
