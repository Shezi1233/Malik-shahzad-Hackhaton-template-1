"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function CheckoutSuccess() {
  const searchParams = useSearchParams();
  const paymentIntentId = searchParams.get("payment_intent");
  const clientSecret = searchParams.get("payment_intent_client_secret");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [orderData, setOrderData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!paymentIntentId) {
      setStatus("error");
      setErrorMsg("No payment information found.");
      return;
    }

    const confirmOrder = async () => {
      try {
        // The shipping info was stored during checkout — retrieve from sessionStorage
        const storedShipping = sessionStorage.getItem("checkout_shipping");
        const shipping = storedShipping
          ? JSON.parse(storedShipping)
          : {
              shipping_name: "Stripe Customer",
              shipping_email: "",
              shipping_address: "",
              shipping_city: "",
              shipping_postal_code: "",
              shipping_country: "",
            };

        const result = await api.post<any>("/payments/confirm", {
          payment_intent_id: paymentIntentId,
          shipping,
        });

        setOrderData(result);
        setStatus("success");

        // Clear stored shipping
        sessionStorage.removeItem("checkout_shipping");
      } catch (err: any) {
        console.error("Order confirmation error:", err);
        setErrorMsg(err.message || "Failed to confirm order");
        setStatus("error");
      }
    };

    confirmOrder();
  }, [paymentIntentId]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Confirming your payment...</p>
          <p className="text-sm text-gray-400 mt-1">Please don&apos;t close this page</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex justify-center items-center min-h-[50vh] p-6">
        <div className="bg-red-50 p-8 rounded-2xl shadow-lg text-center max-w-md">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-700">Payment Issue</h2>
          <p className="text-gray-600 mt-2">{errorMsg || "Something went wrong."}</p>
          <div className="flex gap-3 justify-center mt-6">
            <Link href="/profile">
              <button className="bg-black text-white py-2 px-6 rounded-xl">
                View Orders
              </button>
            </Link>
            <Link href="/">
              <button className="border border-black text-black py-2 px-6 rounded-xl">
                Continue Shopping
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[50vh] p-6">
      <div className="bg-green-50 p-8 rounded-2xl shadow-lg text-center max-w-md">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-green-700">
          Payment Successful!
        </h2>
        <p className="text-gray-600 mt-2">
          Order <strong>#{orderData?.order_id}</strong> has been placed.
        </p>
        <p className="text-lg font-bold text-gray-900 mt-1">
          Total: ${orderData?.total?.toFixed(2)}
        </p>
        <p className="text-xs text-gray-400 mt-1 break-all">
          Payment ID: {orderData?.payment_intent_id}
        </p>
        <div className="flex gap-3 justify-center mt-6">
          <Link href="/profile">
            <button className="bg-black text-white py-2 px-6 rounded-xl font-medium">
              View Orders
            </button>
          </Link>
          <Link href="/">
            <button className="border border-black text-black py-2 px-6 rounded-xl font-medium">
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
