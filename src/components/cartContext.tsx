"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define the cart item interface
interface ICartItem {
  id: number;
  title: string;
  img_url: string;
  price: number; // Must be a number for calculations
  quantity: number;
  size?: string;
  color?: string;
}

// Define the cart context interface
interface ICartContext {
  cart: ICartItem[];
  addToCart: (item: ICartItem) => void;
  removeFromCart: (id: number) => void;
  updateQuantityInCart: (id: number, amount: number) => void;
}

// Create the cart context
const CartContext = createContext<ICartContext | undefined>(undefined);

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// CartProvider component to wrap around your application
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<ICartItem[]>(() => {
    // Initialize the cart from localStorage (if available)
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem("cart");
      return storedCart ? JSON.parse(storedCart) : [];
    }
    return [];
  });

  // Save the cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Add an item to the cart
  const addToCart = (item: ICartItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i.id === item.id);
      if (existingItem) {
        // Update quantity if the item already exists in the cart
        return prevCart.map((i) =>
          i.id === item.id
            ? {
                ...i,
                quantity: i.quantity + 1,
                size: item.size || i.size,
                color: item.color || i.color,
              }
            : i
        );
      }
      // Add a new item to the cart (convert price to number here)
      return [...prevCart, { ...item, price: Number(item.price), quantity: 1 }];
    });
  };

  // Remove an item from the cart
  const removeFromCart = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // Update the quantity of an item in the cart
  const updateQuantityInCart = (id: number, amount: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + amount) }
          : item
      )
    );
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantityInCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
