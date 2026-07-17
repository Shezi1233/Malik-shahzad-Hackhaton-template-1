"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

function CheckoutSuccessContent() {
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
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full" />
            <div className="w-16 h-16 border-4 border-black rounded-full animate-spin absolute top-0 left-0 border-t-transparent" />
          </div>
          <p className="text-gray-700 font-semibold text-lg">Confirming your payment...</p>
          <p className="text-sm text-gray-400 mt-1">Please don&apos;t close this page</p>
          <div className="mt-6 flex justify-center gap-1">
            <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-8 sm:p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Issue</h2>
          <p className="text-gray-500 mb-1">{errorMsg || "Something went wrong while confirming your payment."}</p>
          <p className="text-xs text-gray-400 mb-6">Your card has not been charged. Please try again.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/checkout">
              <button className="bg-black text-white py-3 px-8 rounded-xl font-medium hover:bg-gray-900 transition-colors">
                Try Again
              </button>
            </Link>
            <Link href="/">
              <button className="border-2 border-gray-200 text-gray-700 py-3 px-8 rounded-xl font-medium hover:border-gray-400 hover:text-black transition-all">
                Continue Shopping
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 bg-gray-50/30">
      <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8 sm:p-10 max-w-lg w-full text-center">
        {/* Success animation */}
        <div className="w-24 h-24 bg-gradient-to-br from-green-50 to-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Payment Successful! 🎉</h2>
        <p className="text-gray-500">Thank you for your purchase. Your order has been placed.</p>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-5 mt-6 space-y-3 text-sm border border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Order ID</span>
            <span className="font-bold text-gray-900 text-base">#{orderData?.order_id}</span>
          </div>
          <div className="h-px bg-gray-200" />
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Total Paid</span>
            <span className="font-bold text-2xl text-green-600">${orderData?.total?.toFixed(2)}</span>
          </div>
          <div className="h-px bg-gray-200" />
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Payment</span>
            <span className="flex items-center gap-1.5 text-gray-700 font-medium">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
              Stripe
            </span>
          </div>
          <div className="h-px bg-gray-200" />
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Payment ID</span>
            <span className="text-[11px] text-gray-400 font-mono truncate max-w-[180px]" title={orderData?.payment_intent_id}>
              {orderData?.payment_intent_id}
            </span>
          </div>
        </div>

        <div className="flex gap-3 justify-center mt-8">
          <Link href="/profile">
            <button className="bg-black text-white py-3 px-8 rounded-xl font-medium hover:bg-gray-900 transition-all hover:shadow-lg hover:shadow-black/20 active:scale-[0.98]">
              View My Orders
            </button>
          </Link>
          <Link href="/">
            <button className="border-2 border-gray-200 text-gray-700 py-3 px-8 rounded-xl font-medium hover:border-gray-400 hover:text-black transition-all active:scale-[0.98]">
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccess() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="w-16 h-16 border-4 border-gray-200 rounded-full" />
              <div className="w-16 h-16 border-4 border-black rounded-full animate-spin absolute top-0 left-0 border-t-transparent" />
            </div>
            <p className="text-gray-700 font-semibold">Loading...</p>
          </div>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
