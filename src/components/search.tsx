"use client"

import { useState } from "react";
import { api } from "@/lib/api";

interface Product {
  id: number;
  title: string;
  price: number;
}

const SearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await api.get<{ products: Product[]; total: number }>(`/products/search?q=${encodeURIComponent(searchTerm)}`);
      setResults(data.products || []);
    } catch (e) {
      setResults([]);
    } finally {
      setLoading(false);
    }
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
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="border rounded-md p-2 w-full"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded-md disabled:bg-gray-400"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      <div>
        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((product) => (
              <div key={product.id} className="border p-4 rounded-md shadow-md">
                <h2 className="font-semibold">{product.title}</h2>
                <p>Price: ${product.price}</p>
              </div>
            ))}
          </div>
        ) : (
          searched && !loading && (
            <p className="text-red-500 font-medium">Product not found!</p>
          )
        )}
      </div>
    </div>
  );
};

export default SearchComponent;
