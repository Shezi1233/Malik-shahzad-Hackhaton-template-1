import { useState, useEffect } from "react";
import { Filter, X, SlidersHorizontal, CheckCircle2, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "./ui/buttons";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import ProductCard, { ProductCardSkeleton } from "./ProductCard";

interface Category {
  id: number;
  title: string;
  slug: string;
  description?: string;
  img_url: string;
  price: number;
  old_price?: number;
  rating: number;
  category: string;
  colors?: string[];
  sizes?: string[];
}

export default function Dressstyle() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedStyles, setSelectedStyles] = useState<Set<string>>(new Set());
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [ratingFilter, setRatingFilter] = useState(0);

  // Get unique dress styles from categories
  const dressStyles = categories.length > 0 ?
    ['casual', 'formal', 'sporty', 'boho', 'minimalist'].filter(style =>
      categories.some(cat => cat.category === style)
    ) : [];

  // Get unique colors from categories
  const allColors = categories.length > 0
    ? Array.from(
        new Set(categories.flatMap(cat => cat.colors || []))
      )
    : [];

  // Get unique sizes from categories
  const allSizes = categories.length > 0
    ? Array.from(
        new Set(categories.flatMap(cat => cat.sizes || []))
      )
    : [];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get<any>("/products");
        const products = Array.isArray(response) ? response : (response.products || []);
        setCategories(products);
        setFilteredProducts(products);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const applyFilters = () => {
      // Ensure categories is an array before filtering
      if (!Array.isArray(categories)) {
        setFilteredProducts([]);
        return;
      }

      let filtered = categories.filter(product => {
        // Dress style filter
        if (selectedStyles.size > 0 && !selectedStyles.has(product.category)) {
          return false;
        }
        // Price filter
        if (product.price < priceRange.min || product.price > priceRange.max) {
          return false;
        }
        // Color filter
        if (selectedColors.length > 0 && product.colors && !selectedColors.some(color =>
          product.colors?.includes(color)
        )) {
          return false;
        }
        // Size filter
        if (selectedSizes.length > 0 && product.sizes && !selectedSizes.some(size =>
          product.sizes?.includes(size)
        )) {
          return false;
        }
        // Rating filter
        if (ratingFilter > 0 && product.rating < ratingFilter) {
          return false;
        }
        return true;
      });

      // Ensure filtered is always an array before setting
      setFilteredProducts(Array.isArray(filtered) ? filtered : []);
    };

    applyFilters();
  }, [selectedStyles, priceRange, selectedColors, selectedSizes, ratingFilter, categories]);

  const handleStyleToggle = (style: string) => {
    const newStyles = new Set(selectedStyles);
    if (newStyles.has(style)) {
      newStyles.delete(style);
    } else {
      newStyles.add(style);
    }
    setSelectedStyles(newStyles);
  };

  const handleColorToggle = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color)
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  const handleSizeToggle = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const clearAllFilters = () => {
    setSelectedStyles(new Set());
    setPriceRange({ min: 0, max: 10000 });
    setSelectedColors([]);
    setSelectedSizes([]);
    setRatingFilter(0);
  };

  const getActiveFilterCount = () => {
    let count = selectedStyles.size + selectedColors.length + selectedSizes.length;
    if (ratingFilter > 0) count++;
    if (priceRange.min > 0 || priceRange.max < 10000) count++;
    return count;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse by Dress Style</h1>
          <p className="text-gray-600">Discover your perfect style with our curated collection</p>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4"
          >
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="w-5 h-5" />
              <span className="font-medium">Filters</span>
              {getActiveFilterCount() > 0 && (
                <span className="bg-black text-white text-xs px-2 py-1 rounded-full">
                  {getActiveFilterCount()}
                </span>
              )}
            </div>
            {isFilterOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-1/4 ${isFilterOpen ? 'block' : 'hidden'} lg:block`}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              {/* Clear Filters */}
              {getActiveFilterCount() > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear all filters
                </button>
              )}

              {/* Dress Style Filters */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Dress Style</h3>
                <div className="space-y-3">
                  {dressStyles.map((style) => (
                    <button
                      key={style}
                      onClick={() => handleStyleToggle(style)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors ${selectedStyles.has(style)
                          ? "bg-gray-100 text-gray-900 font-medium"
                          : "text-gray-600 hover:bg-gray-50"}`}
                    >
                      <span className="capitalize">{style}</span>
                      {selectedStyles.has(style) && (
                        <CheckCircle2 className="w-4 h-4 text-gray-900" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Price Range</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>${priceRange.min}</span>
                    <span>${priceRange.max}</span>
                  </div>
                  <div className="relative h-2 bg-gray-200 rounded-full">
                    <div
                      className="absolute h-full bg-gray-900 rounded-full"
                      style={{
                        left: `${(priceRange.min / 10000) * 100}%`,
                        right: `${100 - (priceRange.max / 10000) * 100}%`
                      }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({
                        ...prev,
                        min: Number(e.target.value) || 0
                      }))}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({
                        ...prev,
                        max: Number(e.target.value) || 10000
                      }))}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Colors */}
              {allColors.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Colors</h3>
                  <div className="flex flex-wrap gap-2">
                    {allColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorToggle(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          selectedColors.includes(color)
                            ? "border-gray-900 scale-110"
                            : "border-gray-300 hover:border-gray-400"
                        }`
                        }
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {allSizes.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Sizes</h3>
                  <div className="flex flex-wrap gap-2">
                    {allSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => handleSizeToggle(size)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedSizes.includes(size)
                            ? "bg-gray-900 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Rating */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Minimum Rating</h3>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setRatingFilter(rating === ratingFilter ? 0 : rating)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        ratingFilter === rating
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {rating} <span className="text-yellow-400">⭐</span>
                    </button>
                  ))}
                </div>
              </div>

              <Button className="w-full">
                Apply Filters ({getActiveFilterCount()})
              </Button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:w-3/4">
            {/* Results Summary */}
            <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {loading ? "Loading..." : `${filteredProducts.length} Styles Found`}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Showing {filteredProducts.length} products
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select className="px-3 py-1 border border-gray-300 rounded text-sm bg-white">
                  <option>Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Customer Rating</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(8)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
                <p className="text-gray-400 mb-6">Try adjusting your filters</p>
                <button
                  onClick={clearAllFilters}
                  className="bg-gray-900 text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    old_price={product.old_price}
                    img_url={product.img_url}
                    rating={product.rating}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Filters Tags */}
        {getActiveFilterCount() > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-wrap gap-2">
              {Array.from(selectedStyles).map((style) => (
                <div key={style} className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1">
                  <span className="text-sm font-medium capitalize">{style}</span>
                  <button
                    onClick={() => handleStyleToggle(style)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {selectedColors.map((color) => (
                <div key={color} className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1">
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-medium">{color}</span>
                  <button
                    onClick={() => handleColorToggle(color)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {selectedSizes.map((size) => (
                <div key={size} className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1">
                  <span className="text-sm font-medium">{size}</span>
                  <button
                    onClick={() => handleSizeToggle(size)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {(priceRange.min > 0 || priceRange.max < 10000) && (
                <div className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1">
                  <span className="text-sm font-medium">
                    ${priceRange.min} - ${priceRange.max}
                  </span>
                  <button
                    onClick={() => setPriceRange({ min: 0, max: 10000 })}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {ratingFilter > 0 && (
                <div className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1">
                  <span className="text-sm font-medium">
                    Rating {ratingFilter}+⭐
                  </span>
                  <button
                    onClick={() => setRatingFilter(0)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {
                getActiveFilterCount() > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-gray-600 hover:text-gray-900 underline"
                  >
                    Clear all
                  </button>
                )
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}