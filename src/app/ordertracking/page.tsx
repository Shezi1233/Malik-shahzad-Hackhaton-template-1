"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";

interface TrackedOrder {
  id: number;
  status: string;
  created_at: string;
  items: Array<{
    id: number;
    title: string;
    price: number;
    quantity: number;
  }>;
}

const OrderTracking = () => {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trackOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderId.trim()) {
      setError("Please enter a valid Order ID");
      return;
    }

    setIsLoading(true);
    setError(null);
    setOrder(null);

    try {
      const data = await api.get<TrackedOrder>(`/orders/${orderId}/track`);
      setOrder(data);
    } catch (err: any) {
      setError(err.message || "Order not found. Please check your Order ID.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "text-green-600 bg-green-50";
      case "shipped": return "text-blue-600 bg-blue-50";
      case "processing": return "text-yellow-600 bg-yellow-50";
      case "pending": return "text-gray-600 bg-gray-50";
      case "cancelled": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="min-h-[60vh] flex justify-center items-center px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Track Your Order</h2>

        <form onSubmit={trackOrder} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Enter Order ID</label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g., 1"
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
          >
            {isLoading ? "Searching..." : "Track Order"}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-red-500 text-center text-sm">{error}</p>
        )}

        {order && !isLoading && (
          <div className="mt-6 border rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold">Order #{order.id}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Placed on: {new Date(order.created_at).toLocaleDateString()}
            </p>
            <div className="border-t pt-3">
              <p className="text-sm font-medium mb-2">Items:</p>
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm py-1">
                  <span>{item.title} x{item.quantity}</span>
                  <span>${item.price?.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
