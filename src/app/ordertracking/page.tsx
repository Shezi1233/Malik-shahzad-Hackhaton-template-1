// components/OrderTracking.tsx

"use client"; // <-- Mark as client-side component

import React, { useState } from "react";

const OrderTracking = () => {
  const [orderId, setOrderId] = useState("");
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrderId(e.target.value);
  };

  const trackOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderId) {
      setError("Please enter a valid Order ID");
      return;
    }

    setIsLoading(true);
    setError(null);
    setOrderStatus(null);

    // Simulate an API call to fetch order status
    setTimeout(() => {
      // Simulated order statuses for demonstration
      const orderStatuses = ["Processing", "Shipped", "Delivered", "Cancelled"];

      const randomStatus =
        orderStatuses[Math.floor(Math.random() * orderStatuses.length)];

      setOrderStatus(randomStatus);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Track Your Order
      </h2>

      <form onSubmit={trackOrder} className="space-y-4">
        <div>
          <label
            htmlFor="orderId"
            className="block text-sm font-medium text-gray-700"
          >
            Enter Order ID or Email
          </label>
          <input
            type="text"
            id="orderId"
            value={orderId}
            onChange={handleInputChange}
            placeholder="Order ID or Email"
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-black text-white py-2 rounded-md hover:bg-gra focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-300"
        >
          {isLoading ? "Tracking..." : "Track Order"}
        </button>
      </form>

      {error && <p className="mt-4 text-red-500 text-center">{error}</p>}

      {orderStatus && !isLoading && (
        <div className="mt-6 text-center">
          <h3 className="text-xl font-semibold">Order Status:</h3>
          <p className="text-lg text-green-600">{orderStatus}</p>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
