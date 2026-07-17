"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/authContext";
import { useCart } from "@/components/cartContext";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StripeProvider from "@/components/StripeProvider";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

/* ── Inner form that lives inside <Elements> ── */
function StripeCheckoutForm({
  shipping,
  onSuccess,
  onError,
}: {
  shipping: Record<string, string>;
  onSuccess: (data: any) => void;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    onError("");

    try {
      // Store shipping info for the success page to use when confirming order
      sessionStorage.setItem("checkout_shipping", JSON.stringify(shipping));

      // 1. Confirm payment with Stripe — redirects to success page on success
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
          payment_method_data: {
            billing_details: {
              name: shipping.shipping_name,
              email: shipping.shipping_email,
              address: {
                line1: shipping.shipping_address,
                city: shipping.shipping_city,
                postal_code: shipping.shipping_postal_code,
                country: shipping.shipping_country === "Pakistan" ? "PK" : "US",
              },
            },
          },
        },
      });

      if (stripeError) {
        onError(stripeError.message || "Payment failed");
        setProcessing(false);
        return;
      }
      // If no error, Stripe redirects to success page
    } catch (err: any) {
      onError(err.message || "Something went wrong");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Stripe Payment Element — card number, expiry, CVC */}
      <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
        <PaymentElement />
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-black text-white py-3.5 rounded-xl hover:bg-gray-800 disabled:bg-gray-400 transition-colors font-semibold text-base"
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing Payment...
          </span>
        ) : (
          "Pay & Place Order"
        )}
      </button>

      <p className="text-xs text-center text-gray-400">
        🔒 Secured by Stripe. Your card info is encrypted end-to-end.
      </p>
    </form>
  );
}

/* ── Main checkout page ── */
const Checkout = () => {
  const { user } = useAuth();
  const { cart, cartTotal } = useCart();
  const router = useRouter();

  const [shipping, setShipping] = useState({
    shipping_name: "",
    shipping_email: "",
    shipping_address: "",
    shipping_city: "",
    shipping_postal_code: "",
    shipping_country: "",
    promo_code: "",
  });

  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [loadingIntent, setLoadingIntent] = useState(false);
  const [error, setError] = useState("");
  const [orderConfirmed, setOrderConfirmed] = useState<any>(null);

  // Pre-fill shipping from user profile
  useEffect(() => {
    if (user) {
      setShipping((prev) => ({
        ...prev,
        shipping_name: user.full_name || user.username || "",
        shipping_email: user.email || "",
        shipping_address: user.address || "",
        shipping_city: user.city || "",
        shipping_postal_code: user.postal_code || "",
        shipping_country: user.country || "",
      }));
    }
  }, [user]);

  // Create PaymentIntent when shipping is valid
  const createPaymentIntent = async () => {
    if (!user || cart.length === 0) return;

    setLoadingIntent(true);
    setError("");
    try {
      const data = await api.post<{
        client_secret: string;
        amount: number;
        payment_intent_id: string;
      }>("/payments/create-payment-intent", {});
      setClientSecret(data.client_secret);
      setPaymentIntentId(data.payment_intent_id);
    } catch (err: any) {
      setError(err.message || "Failed to initialize payment");
    } finally {
      setLoadingIntent(false);
    }
  };

  // Auto-create payment intent when user has items
  useEffect(() => {
    if (user && cart.length > 0 && !clientSecret) {
      createPaymentIntent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, cart]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShipping((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setShipping((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ── Not signed in ──
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
        <h2 className="text-2xl font-bold mb-4">Checkout</h2>
        <p className="text-gray-600 mb-4">Please sign in to checkout.</p>
        <Link href="/signin">
          <button className="bg-black text-white py-2 px-6 rounded-md">
            Sign In
          </button>
        </Link>
      </div>
    );
  }

  // ── Empty cart ──
  if (cart.length === 0 && !orderConfirmed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
        <h2 className="text-2xl font-bold mb-4">Checkout</h2>
        <p className="text-gray-600 mb-4">Your cart is empty.</p>
        <Link href="/">
          <button className="bg-black text-white py-2 px-6 rounded-md">
            Continue Shopping
          </button>
        </Link>
      </div>
    );
  }

  // ── Order confirmed ──
  if (orderConfirmed) {
    return (
      <div className="flex justify-center items-center p-6 min-h-[50vh]">
        <div className="bg-green-50 p-8 rounded-2xl shadow-lg text-center max-w-md">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-700">
            Payment Successful!
          </h2>
          <p className="text-gray-600 mt-2">Order #{orderConfirmed.order_id}</p>
          <p className="text-gray-600">
            Total: ${orderConfirmed.total?.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Payment ID: {orderConfirmed.payment_intent_id}
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <Link href="/profile">
              <button className="bg-black text-white py-2 px-6 rounded-md">
                View Orders
              </button>
            </Link>
            <Link href="/">
              <button className="border border-black text-black py-2 px-6 rounded-md">
                Continue Shopping
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Main checkout form ──
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-8 text-center">Checkout</h2>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl mb-6 border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT — Shipping Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Shipping Details
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="shipping_name"
              value={shipping.shipping_name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="shipping_email"
              value={shipping.shipping_email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              name="shipping_address"
              value={shipping.shipping_address}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black bg-gray-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                name="shipping_city"
                value={shipping.shipping_city}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                name="shipping_postal_code"
                value={shipping.shipping_postal_code}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <select
              name="shipping_country"
              value={shipping.shipping_country}
              onChange={handleSelectChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black bg-gray-50"
            >
              <option value="">Select Country</option>
              <option value="Pakistan">Pakistan</option>
              <option value="India">India</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="UAE">UAE</option>
              <option value="Saudi Arabia">Saudi Arabia</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Promo Code
            </label>
            <input
              type="text"
              name="promo_code"
              value={shipping.promo_code}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black bg-gray-50"
              placeholder="DISCOUNT10"
            />
          </div>
        </div>

        {/* RIGHT — Payment + Order Summary */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h3>
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-gray-600 truncate max-w-[200px]">
                    {item.title} × {item.quantity}
                  </span>
                  <span className="font-medium">
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <hr className="border-gray-200" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery</span>
                <span>$15.00</span>
              </div>
              {shipping.promo_code?.toUpperCase() === "DISCOUNT10" && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount (DISCOUNT10)</span>
                  <span>-$30.00</span>
                </div>
              )}
              <hr className="border-gray-200" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>
                  $
                  {(
                    cartTotal +
                    15 -
                    (shipping.promo_code?.toUpperCase() === "DISCOUNT10"
                      ? 30
                      : 0)
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Stripe Payment Section */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              💳 Payment
              <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                Powered by Stripe
              </span>
            </h3>

            {loadingIntent ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-8 h-8 border-3 border-gray-300 border-t-black rounded-full animate-spin mb-3" />
                <p className="text-sm text-gray-500">Preparing payment...</p>
              </div>
            ) : clientSecret ? (
              <StripeProvider clientSecret={clientSecret}>
                <StripeCheckoutForm
                  shipping={shipping}
                  onSuccess={(data) => setOrderConfirmed(data)}
                  onError={(msg) => setError(msg)}
                />
              </StripeProvider>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>Add items to your cart to proceed with payment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
