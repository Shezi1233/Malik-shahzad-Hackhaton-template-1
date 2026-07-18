"use client";

import { FaSearchengin } from "react-icons/fa6";
import Link from "next/link";
import Image from "next/image";
import { SheetSide } from "./sheet";
import { NavigationMenuDemo } from "./NavigationMenu";
import Notifications from "./notifications";
import { IoIosSearch } from "react-icons/io";
import { IoCartOutline } from "react-icons/io5";
import { Heart } from "lucide-react";
import { useAuth } from "./authContext";
import { useCart } from "./cartContext";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface SearchProduct {
  id: number;
  title: string;
  price: number;
  old_price?: number | null;
  img_url: string;
  rating: number;
}

export default function Header() {
  const { user, signout } = useAuth();
  const { cart } = useCart();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Auth dropdown close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  const searchProducts = useCallback(async (query: string) => {
    if (!query.trim() || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const data = await api.get<{ products: SearchProduct[]; total: number }>(
        `/products/search?q=${encodeURIComponent(query.trim())}`
      );
      setSearchResults(data.products || []);
      setSearchOpen(true);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchProducts(value), 300);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchOpen(false);
    }
  };

  const handleResultClick = (id: number) => {
    setSearchOpen(false);
    setSearchTerm("");
    setSearchResults([]);
    router.push(`/products/${id}`);
  };

  return (
    <header className="w-full h-[60px] bg-white flex justify-between items-center max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8">
      {/* left */}
      <div className="flex justify-center items-center text-black font-black">
        <SheetSide />
        <Link href="/">
          <h1 className="text-2xl sm:text-black sm:text-4xl pl-2">SHOP.CO</h1>
        </Link>
      </div>

      {/* navbar */}
      <ul className="hidden md:block">
        <li className="space-x-5 flex items-center">
          <Link href={""}>
            <NavigationMenuDemo />
          </Link>
          <Link href={"/all-products?category=new_arrivals"}>New Arrivals</Link>
          <Link href={"/all-products?category=top_selling"}>Top Selling</Link>
          <Link href={"/all-products"}>All Products</Link>
          <Link href={"/casual"}>On Sale</Link>
        </li>
      </ul>

      {/* SEARCH BAR - Desktop */}
      <div className="hidden md:block relative" ref={searchRef}>
        <form onSubmit={handleSearchSubmit}>
          <div className="flex items-center w-[330px] h-[40px] rounded-[62px] bg-[#F0F0F0] focus-within:ring-2 focus-within:ring-gray-300 transition-all">
            <FaSearchengin className="text-xl ml-3 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for products..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
              className="w-full ml-2 outline-none h-full rounded-[62px] bg-[#F0F0F0] text-sm"
            />
            {searchLoading && (
              <div className="mr-3 w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            )}
          </div>
        </form>

        {/* Search Dropdown */}
        {searchOpen && (searchResults.length > 0 || searchLoading) && (
          <div className="absolute top-[48px] left-0 w-full bg-white rounded-2xl shadow-xl border border-gray-100 z-50 max-h-[420px] overflow-y-auto">
            {searchLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleResultClick(product.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#F0EEED] overflow-hidden flex-shrink-0">
                      <Image
                        src={product.img_url}
                        alt={product.title}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                       
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/products/product_1.png";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {product.title}
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        ${product.price}
                        {product.old_price && (
                          <span className="text-gray-400 font-normal line-through ml-2 text-xs">
                            ${product.old_price}
                          </span>
                        )}
                      </p>
                    </div>
                  </button>
                ))}
                <Link
                  href={`/search?q=${encodeURIComponent(searchTerm)}`}
                  onClick={() => setSearchOpen(false)}
                  className="block text-center py-3 text-sm font-medium text-gray-500 hover:text-black hover:bg-gray-50 border-t border-gray-100 transition-colors"
                >
                  View all results for &ldquo;{searchTerm}&rdquo;
                </Link>
              </>
            )}
          </div>
        )}
      </div>

      {/* right side icons */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Mobile Search Icon */}
        <button
          onClick={() => {
            searchInputRef.current?.focus();
            router.push("/search");
          }}
          className="md:hidden p-1.5"
          aria-label="Search products"
        >
          <IoIosSearch className="text-2xl" />
        </button>

        <Link href={"/wishlist"} className="relative">
          <Heart className="text-2xl sm:text-3xl" />
        </Link>
        <Link href={"/cart"} className="relative">
          <IoCartOutline className="text-2xl sm:text-3xl" />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-[18px] h-[18px] flex items-center justify-center rounded-full">
              {cart.length}
            </span>
          )}
        </Link>
        <Notifications />

        {/* Auth */}
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-1 bg-black text-white px-3 py-1.5 rounded-full text-sm font-medium hover:bg-gray-800"
            >
              <span>{user.username}</span>
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg border z-50">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => setDropdownOpen(false)}
                >
                  My Profile
                </Link>
                {user.is_admin && (
                  <Link
                    href="/admin"
                    className="block px-4 py-2 text-sm hover:bg-gray-100 font-medium"
                    onClick={() => setDropdownOpen(false)}
                  >
                    ⚡ Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    signout();
                  }}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/signin"
            className="bg-black text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-gray-800"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
