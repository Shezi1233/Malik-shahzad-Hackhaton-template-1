"use client";
import { useCart } from "@/components/cartContext";
import { useState } from "react";
import { BreadcrumbDemo } from "@/components/Bredcrupm";
import { Button } from "@/components/ui/buttons";
import { Delete, Minus, Plus } from "lucide-react";
import Image from "next/image";

export default function Cart() {
  const { cart, removeFromCart, updateQuantityInCart } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const deliveryFee = 15;

  // Calculate subtotal dynamically
  const subtotal = cart.reduce(
    (total, item) => total + Number(item.price) * Number(item.quantity),
    0
  );

  // Calculate total dynamically
  const total = subtotal - discount + deliveryFee;

  // Promo code application logic
  const applyPromoCode = () => {
    if (promoCode.trim().toUpperCase() === "DISCOUNT10") {
      setDiscount(30); // Set discount if the promo code is valid
    } else {
      alert("Invalid promo code");
      setDiscount(0); // Reset discount if invalid
    }
  };

  return (
    <>
      <div className="pl-5">
        <BreadcrumbDemo />
        <h1 className="text-2xl font-bold mt-2">Your cart</h1>
      </div>
      <div className="flex flex-col md:flex-row justify-center items-start gap-3 mt-6">
        {/* Cart Items Section */}
        <div className="w-full h-full md:w-[700px] md:h-[500px] border rounded-[20px]">
          {cart.length === 0 ? (
            <p className="p-4">Your cart is empty</p>
          ) : (
            cart.map((item) => (
              <div className="flex justify-between mt-4 p-4 border-b" key={item.id}>
                <div className="flex gap-3">
                  <Image
                    src={item.img_url}
                    alt={item.title}
                    className="rounded-[16px]"
                    width={100}
                    height={100}
                  />
                  <div>
                    <h3 className="font-bold">{item.title}</h3>
                    <p className="text-sm">Size: {item.size || "N/A"}</p>
                    <p className="text-sm">Color: {item.color || "N/A"}</p>
                    <p className="font-bold">${Number(item.price).toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex flex-col justify-between items-center space-y-5">
                  <Delete
                    onClick={() => removeFromCart(item.id)}
                    className="cursor-pointer"
                  />
                  <div className="w-[100px] h-[40px] flex justify-between p-3 items-center rounded-[62px] bg-[#F0F0F0] text-black">
                    <Minus
                      onClick={() => updateQuantityInCart(item.id, -1)}
                      className="cursor-pointer"
                    />
                    {item.quantity}
                    <Plus
                      onClick={() => updateQuantityInCart(item.id, 1)}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Order Summary Section */}
        <div className="w-full md:w-[400px] h-full md:h-[450px] border rounded-[20px] flex flex-col justify-start items-center p-4">
          <div className="w-[90%] space-y-2">
            <h1 className="text-xl font-bold">Order Summary</h1>
            <p className="flex justify-between">
              Subtotal <span>${subtotal.toFixed(2)}</span>
            </p>
            <p className="flex justify-between">
              Discount{" "}
              <span className="text-red-600">-${discount.toFixed(2)}</span>
            </p>
            <p className="flex justify-between">
              Delivery Fee <span>${deliveryFee.toFixed(2)}</span>
            </p>
            <p className="flex justify-between font-bold">
              Total <span>${total.toFixed(2)}</span>
            </p>

            <div className="flex flex-col md:flex-row md:items-center md:space-x-2 space-y-2 md:space-y-0">
              <input
                className="bg-[#F0F0F0] w-full py-2 px-5 rounded-full text-gray-600 outline-none"
                placeholder="Add promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <Button
                className="rounded-full text-sm font-light w-full md:w-auto h-[48px]"
                onClick={applyPromoCode}
              >
                Apply
              </Button>
            </div>
            <a href="/checkout">
              <Button className="w-full rounded-full mt-14">Go To Checkout</Button>
            </a>
            <a href="/ordertracking">
              <Button className="w-full rounded-full mt-5">Order Tracking</Button>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
