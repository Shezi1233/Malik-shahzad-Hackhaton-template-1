"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/authContext";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Checkout = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    shipping_name: user?.full_name || "",
    shipping_email: user?.email || "",
    shipping_address: user?.address || "",
    shipping_city: user?.city || "",
    shipping_postal_code: user?.postal_code || "",
    shipping_country: user?.country || "",
    payment_method: "creditCard",
    promo_code: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<number | null>(null);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/signin");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const order = await api.post<{ id: number }>("/orders", formData);
      setOrderConfirmed(order.id);
    } catch (err: any) {
      setError(err.message || "Failed to create order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
        <h2 className="text-2xl font-bold mb-4">Checkout</h2>
        <p className="text-gray-600 mb-4">Please sign in to checkout.</p>
        <Link href="/signin">
          <button className="bg-black text-white py-2 px-6 rounded-md">Sign In</button>
        </Link>
      </div>
    );
  }

  if (orderConfirmed) {
    return (
      <div className="flex justify-center items-center p-6 min-h-[50vh]">
        <div className="bg-green-50 p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-700">Order Confirmed!</h2>
          <p className="text-gray-600 mt-2">Order #{orderConfirmed}</p>
          <p className="text-gray-600">Your order has been placed successfully.</p>
          <div className="flex gap-3 justify-center mt-6">
            <Link href="/profile">
              <button className="bg-black text-white py-2 px-6 rounded-md">View Orders</button>
            </Link>
            <Link href="/">
              <button className="border border-black text-black py-2 px-6 rounded-md">Continue Shopping</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Checkout</h2>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" name="shipping_name" value={formData.shipping_name} onChange={handleInputChange} required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="shipping_email" value={formData.shipping_email} onChange={handleInputChange} required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input type="text" name="shipping_address" value={formData.shipping_address} onChange={handleInputChange} required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input type="text" name="shipping_city" value={formData.shipping_city} onChange={handleInputChange} required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Postal Code</label>
            <input type="text" name="shipping_postal_code" value={formData.shipping_postal_code} onChange={handleInputChange} required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Country</label>
          <input type="text" name="shipping_country" value={formData.shipping_country} onChange={handleInputChange} required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Payment Method</label>
          <select name="payment_method" value={formData.payment_method} onChange={handleSelectChange}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black">
            <option value="creditCard">Credit Card</option>
            <option value="paypal">PayPal</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Promo Code</label>
          <input type="text" name="promo_code" value={formData.promo_code} onChange={handleInputChange}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="DISCOUNT10" />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 disabled:bg-gray-400 transition-colors font-medium"
        >
          {isSubmitting ? "Processing..." : "Confirm Order"}
        </button>
      </form>
    </div>
  );
};

export default Checkout;
