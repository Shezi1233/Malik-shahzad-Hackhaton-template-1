"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useAuth } from "./authContext";
import { api, invalidateCache } from "@/lib/api";

interface ICartItem {
  id: number;
  title: string;
  img_url: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

interface ICartContext {
  cart: ICartItem[];
  addToCart: (item: ICartItem) => void;
  removeFromCart: (id: number) => void;
  updateQuantityInCart: (id: number, amount: number) => void;
  cartTotal: number;
  fetchCart: () => Promise<void>;
}

const CartContext = createContext<ICartContext | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<ICartItem[]>([]);

  // Load cart on mount and when auth state changes
  useEffect(() => {
    if (user) {
      // Authenticated: fetch from API
      api.get<{ items: ICartItem[]; total: number }>("/cart")
        .then((data) => setCart(data.items))
        .catch(() => setCart([]));
    } else {
      // Not authenticated: load from localStorage
      const storedCart = localStorage.getItem("cart");
      setCart(storedCart ? JSON.parse(storedCart) : []);
    }
  }, [user]);

  // Save to localStorage when cart changes (only for non-authed)
  useEffect(() => {
    if (!user) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, user]);

  const syncCartToServer = useCallback(async (localCart: ICartItem[]) => {
    if (!user || localCart.length === 0) return;
    for (const item of localCart) {
      try {
        await api.post("/cart", {
          product_id: item.id,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        });
      } catch (e) {
        console.error("Failed to sync cart item:", e);
      }
    }
    // Clear local cart after sync
    localStorage.removeItem("cart");
    // Fetch fresh cart from server (bypass cache)
    invalidateCache("/cart");
    const data = await api.get<{ items: ICartItem[]; total: number }>("/cart");
    setCart(data.items);
  }, [user]);

  // When user logs in, sync local cart to server
  useEffect(() => {
    if (user) {
      const localCart = localStorage.getItem("cart");
      if (localCart) {
        const items = JSON.parse(localCart);
        if (items.length > 0) {
          syncCartToServer(items);
        }
      }
    }
  }, [user, syncCartToServer]);

  const addToCart = useCallback(async (item: ICartItem) => {
    if (user) {
      // API mode
      try {
        await api.post("/cart", {
          product_id: item.id,
          quantity: item.quantity || 1,
          size: item.size,
          color: item.color,
        });
        invalidateCache("/cart");
        const data = await api.get<{ items: ICartItem[]; total: number }>("/cart");
        setCart(data.items);
      } catch (e) {
        console.error("Failed to add to cart:", e);
      }
    } else {
      // localStorage mode
      setCart((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        if (existing) {
          return prev.map((i) =>
            i.id === item.id
              ? { ...i, quantity: i.quantity + (item.quantity || 1), size: item.size || i.size, color: item.color || i.color }
              : i
          );
        }
        return [...prev, { ...item, quantity: item.quantity || 1 }];
      });
    }
  }, [user]);

  const removeFromCart = useCallback(async (id: number) => {
    if (user) {
      try {
        await api.delete(`/cart/${id}`);
        invalidateCache("/cart");
        const data = await api.get<{ items: ICartItem[]; total: number }>("/cart");
        setCart(data.items);
      } catch (e) {
        console.error("Failed to remove from cart:", e);
      }
    } else {
      setCart((prev) => prev.filter((item) => item.id !== id));
    }
  }, [user]);

  const updateQuantityInCart = useCallback(async (id: number, amount: number) => {
    if (user) {
      try {
        const item = cart.find((i) => i.id === id);
        if (!item) return;
        const newQty = Math.max(1, item.quantity + amount);
        await api.put(`/cart/${id}`, { quantity: newQty });
        invalidateCache("/cart");
        const data = await api.get<{ items: ICartItem[]; total: number }>("/cart");
        setCart(data.items);
      } catch (e) {
        console.error("Failed to update cart:", e);
      }
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(1, item.quantity + amount) }
            : item
        )
      );
    }
  }, [user, cart]);

  const cartTotal = cart.reduce((total, item) => total + Number(item.price) * Number(item.quantity), 0);

  const fetchCart = useCallback(async () => {
    if (!user) return;
    try {
      invalidateCache("/cart");
      const data = await api.get<{ items: ICartItem[]; total: number }>("/cart");
      setCart(data.items);
    } catch {
      setCart([]);
    }
  }, [user]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantityInCart, cartTotal, fetchCart }}
    >
    >
      {children}
    </CartContext.Provider>
  );
};
