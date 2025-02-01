"use client"
import { useState } from "react";

const SearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<{ id: number; name: string; price: number }[]>([]);

  // Mock product list
  const products = [
    { id: 1, name: "T-SHIRT WITH TAPE DETAILS", price: 140 },
    { id: 2, name: "SKINNY FIT JEANS", price: 120 },
    { id: 3, name: "HECKERED SHIRT", price: 120 },
    { id: 4, name: "SLEEVE STRIPED T-SHIRT", price: 120 },
    { id: 5, name: "VERTICAL STRIPED SHIRT", price: 212 },
    { id: 6, name: "OURAGE GRAPHIC T-SHIRT", price: 145 },
    { id: 7, name: "LOOSE FIT BERMUDA SHORTS", price: 80 },
    { id: 8, name: "FADED SKINNY JEANS", price: 210 },
    { id: 9, name: "Polo with Contrast Trims", price: 212 },
    { id: 10, name: "Gradient Graphic T-shirt", price: 145 },
    { id: 11, name: "Polo with Tipping Details", price: 180 },
    { id: 12, name: "Black Striped T-shirt", price: 120 },
  ];

  const handleSearch = () => {
    const filteredResults = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setResults(filteredResults);
  };

  return (
    <div className="p-5 mb-5">
      <h1 className="font-bold text-lg mb-4">Search Products</h1>
      <div className="flex items-center space-x-4 mb-6">
        <input
          type="text"
          placeholder="Search for a product..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded-md p-2 w-full"
        />
        <button
          onClick={handleSearch}
          className="bg-black text-white px-4 py-2 rounded-md"
        >
          Search
        </button>
      </div>

      {/* Search Results */}
      <div>
        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((product) => (
              <div
                key={product.id}
                className="border p-4 rounded-md shadow-md"
              >
                <h2 className="font-semibold">{product.name}</h2>
                <p>Price: ${product.price}</p>
              </div>
            ))}
          </div>
        ) : (
          searchTerm && (
            <p className="text-red-500 font-medium">Product not found!</p>
          )
        )}
      </div>
    </div>
  );
};

export default SearchComponent;
