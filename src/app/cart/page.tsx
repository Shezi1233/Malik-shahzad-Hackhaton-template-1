"use client";

import { useCart } from "@/components/cartContext";
import { useAuth } from "@/components/authContext";
import { useState } from "react";
import { BreadcrumbDemo } from "@/components/Bredcrupm";
import { Button } from "@/components/ui/buttons";
import { Delete, Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Cart() {
  const { cart, removeFromCart, updateQuantityInCart, cartTotal } = useCart();
  const { user } = useAuth();
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const deliveryFee = 15;

  const subtotal = cartTotal;
  const total = subtotal - discount + deliveryFee;

  const applyPromoCode = () => {
    if (promoCode.trim().toUpperCase() === "DISCOUNT10") {
      setDiscount(30);
    } else {
      alert("Invalid promo code");
      setDiscount(0);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
        <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
        <p className="text-gray-600 mb-4">Please sign in to view and manage your cart.</p>
        <Link href="/signin">
          <Button className="rounded-full px-8">Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-screen-2xl px-3 sm:px-8 mx-auto">
        <BreadcrumbDemo />
        <h1 className="text-2xl font-bold mt-2">Your Cart</h1>
      </div>
      <div className="flex flex-col md:flex-row justify-center items-start gap-3 mt-6 max-w-screen-2xl mx-auto px-4">
        {/* Cart Items Section */}
        <div className="w-full md:w-[700px] border rounded-[20px]">
          {cart.length === 0 ? (
            <p className="p-8 text-center text-gray-500">Your cart is empty</p>
          ) : (
            cart.map((item) => (
              <div
                className="flex justify-between p-3 sm:p-4 border-b"
                key={item.id}
              >
                <div className="flex gap-2 sm:gap-3 flex-1 min-w-0">
                  <Image
                    src={item.img_url}
                    alt={item.title}
                    className="rounded-[16px] object-cover flex-shrink-0"
                    width={80}
                    height={80}
                  />
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm sm:text-base truncate">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-500">Size: {item.size || "N/A"}</p>
                    <p className="text-xs sm:text-sm text-gray-500">Color: {item.color || "N/A"}</p>
                    <p className="font-bold mt-1 text-sm sm:text-base">${Number(item.price).toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex flex-col justify-between items-center space-y-5 flex-shrink-0 ml-2">
                  <Delete
                    onClick={() => removeFromCart(item.id)}
                    className="cursor-pointer hover:text-red-500"
                    size={20}
                  />
                  <div className="w-[100px] h-[40px] flex justify-between p-3 items-center rounded-[62px] bg-[#F0F0F0]">
                    <Minus
                      onClick={() => updateQuantityInCart(item.id, -1)}
                      className="cursor-pointer"
                      size={16}
                    />
                    <span className="text-sm font-medium">{item.quantity}</span>
                    <Plus
                      onClick={() => updateQuantityInCart(item.id, 1)}
                      className="cursor-pointer"
                      size={16}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Summary Section */}
        <div className="w-full md:w-[400px] border rounded-[20px] p-6">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Discount</span>
              <span className="text-red-500">-${discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="font-medium">${deliveryFee.toFixed(2)}</span>
            </div>
            <hr />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <div className="flex gap-2 mt-4">
              <input
                className="bg-[#F0F0F0] flex-1 py-2 px-4 rounded-full text-sm outline-none"
                placeholder="Add promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <Button
                className="rounded-full text-sm px-6"
                onClick={applyPromoCode}
              >
                Apply
              </Button>
            </div>

            <Link href="/checkout">
              <Button className="w-full rounded-full mt-4">
                Go To Checkout
              </Button>
            </Link>
            <Link href="/ordertracking">
              <Button className="w-full rounded-full mt-2" variant="outline">
                Order Tracking
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
