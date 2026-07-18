"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/authContext";
import { useCart } from "@/components/cartContext";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import StripeProvider from "@/components/StripeProvider";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  ArrowLeft,
  CreditCard,
  ShieldCheck,
  Truck,
  Package,
  ChevronDown,
  Check,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";

/* ── Icon mapping for input fields ── */
const FieldIcon = ({ type }: { type: string }) => {
  const iconClass = "w-4 h-4 text-gray-400";
  switch (type) {
    case "user": return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;
    case "email": return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>;
    case "home": return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>;
    case "city": return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21V4.5c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m-7.5 0h7.5m-7.5 0h-3a1.125 1.125 0 01-1.125-1.125V16.5m9.75 0V21m0 0h3a1.125 1.125 0 001.125-1.125v-3.75M4.5 21h15" /></svg>;
    case "zip": return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6m-7 7h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
    case "world": return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>;
    case "tag": return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg>;
    default: return null;
  }
};

/* ── Animated trust badge ── */
const TrustBadge = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex items-center gap-2 text-xs text-gray-500 group cursor-default">
    <span className="text-gray-400 group-hover:text-black transition-colors duration-300">{icon}</span>
    <span className="group-hover:text-gray-700 transition-colors duration-300">{text}</span>
  </div>
);

/* ── Step indicator ── */
const StepBadge = ({ number, label, active }: { number: number; label: string; active: boolean }) => (
  <div className={`flex items-center gap-2.5 ${active ? "opacity-100" : "opacity-40"}`}>
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${active ? "bg-black text-white shadow-md" : "bg-gray-200 text-gray-500"}`}>
      {active ? <Check className="w-3.5 h-3.5" /> : number}
    </div>
    <span className={`text-sm font-medium ${active ? "text-black" : "text-gray-500"}`}>{label}</span>
  </div>
);

/* ── Stripe payment form ── */
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
      sessionStorage.setItem("checkout_shipping", JSON.stringify(shipping));

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
    } catch (err: any) {
      onError(err.message || "Something went wrong");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Payment Element */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 transition-all duration-200 hover:border-gray-300">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
          <CreditCard className="w-4 h-4 text-black" />
          <span className="text-sm font-semibold text-gray-900">Card Details</span>
          <div className="ml-auto flex gap-1.5">
            <span className="text-[10px] font-medium px-2 py-0.5 bg-blue-50 text-blue-600 rounded">VISA</span>
            <span className="text-[10px] font-medium px-2 py-0.5 bg-red-50 text-red-500 rounded">MC</span>
          </div>
        </div>
        <PaymentElement />
      </div>

      {/* Pay button */}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-black hover:bg-gray-900 text-white py-4 rounded-xl font-semibold text-base transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none hover:shadow-lg hover:shadow-black/20 active:scale-[0.98] flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <LockIcon />
            Pay & Place Order
          </>
        )}
      </button>

      {/* Trust badges */}
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 pt-2">
        <TrustBadge icon={<ShieldCheck className="w-3.5 h-3.5" />} text="SSL Encrypted" />
        <TrustBadge icon={<LockIconSmall />} text="Secure Payment" />
        <TrustBadge icon={<Package className="w-3.5 h-3.5" />} text="Money-back Guarantee" />
      </div>
    </form>
  );
}

const LockIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const LockIconSmall = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

/* ── Main checkout page ── */
const Checkout = () => {
  const { user } = useAuth();
  const { cart, cartTotal, removeFromCart, updateQuantityInCart } = useCart();
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
  const [orderConfirmed, setOrderConfirmed] = useState(null) as any;
  const [step, setStep] = useState<"shipping" | "payment">("shipping");
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "cod">("stripe");
  const [codProcessing, setCodProcessing] = useState(false);

  const handleCODSubmit = async () => {
    setCodProcessing(true);
    setError("");
    try {
      const result = await api.post<any>("/payments/cod-confirm", {
        shipping: { ...shipping, promo_code: shipping.promo_code || "" },
      });
      setOrderConfirmed(result);
    } catch (err: any) {
      setError(err.message || "Failed to place order");
    } finally {
      setCodProcessing(false);
    }
  };
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

  // Create PaymentIntent when step changes to payment
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

  // Validate shipping form
  const validateShipping = () => {
    const errors: Record<string, string> = {};
    if (!shipping.shipping_name.trim()) errors.shipping_name = "Full name is required";
    if (!shipping.shipping_email.trim()) errors.shipping_email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(shipping.shipping_email)) errors.shipping_email = "Invalid email format";
    if (!shipping.shipping_address.trim()) errors.shipping_address = "Address is required";
    if (!shipping.shipping_city.trim()) errors.shipping_city = "City is required";
    if (!shipping.shipping_country) errors.shipping_country = "Country is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinueToPayment = () => {
    if (validateShipping()) {
      setStep("payment");
      if (!clientSecret) {
        createPaymentIntent();
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShipping((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear error on change
    if (formErrors[e.target.name]) {
      setFormErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setShipping((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (formErrors[e.target.name]) {
      setFormErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const subtotal = cartTotal;
  const discount = shipping.promo_code?.toUpperCase() === "DISCOUNT10" ? 30 : 0;
  const deliveryFee = cart.length > 0 ? 15 : 0;
  const total = subtotal - discount + deliveryFee;

  // ── Not signed in ──
  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Sign in to Checkout</h2>
          <p className="text-gray-500 mb-6 text-sm">Please sign in to access your cart and complete your purchase.</p>
          <Link href="/signin">
            <button className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-900 transition-colors">
              Sign In
            </button>
          </Link>
          <Link href="/">
            <button className="w-full mt-3 py-3 rounded-xl font-medium text-gray-600 hover:text-black border border-gray-200 hover:border-gray-400 transition-all">
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Empty cart ──
  if (cart.length === 0 && !orderConfirmed) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-6 text-sm">Add some products to your cart before checking out.</p>
          <Link href="/all-products">
            <button className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-900 transition-colors">
              Browse Products
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Order confirmed ──
  if (orderConfirmed) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8 sm:p-10 max-w-lg w-full text-center">
          {/* Success animation */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {orderConfirmed.payment_method === "cod" ? "Order Placed! 🎉" : "Payment Successful! 🎉"}
          </h2>
          <p className="text-gray-500 mb-1">
            {orderConfirmed.payment_method === "cod" ? "Your order has been placed. Pay when you receive." : "Thank you for your purchase"}
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mt-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Order ID</span>
              <span className="font-semibold">#{orderConfirmed.order_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Paid</span>
              <span className="font-bold text-lg text-green-600">${orderConfirmed.total?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment ID</span>
              <span className="text-xs text-gray-400 truncate max-w-[180px]">{orderConfirmed.payment_intent_id}</span>
            </div>
          </div>
          <div className="flex gap-3 justify-center mt-8">
            <Link href="/profile">
              <button className="bg-black text-white py-3 px-8 rounded-xl font-medium hover:bg-gray-900 transition-colors">
                View Orders
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

  // ── Main checkout ──
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Back + Title */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="text-sm text-gray-500 mt-0.5">{cart.length} item{cart.length !== 1 ? "s" : ""} in your cart</p>
          </div>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-0 mb-8 bg-white rounded-xl px-6 py-3 shadow-sm border border-gray-100">
          <StepBadge number={1} label="Shipping" active={step === "shipping"} />
          <div className="flex-1 mx-4 h-px bg-gray-200" />
          <StepBadge number={2} label="Payment" active={step === "payment"} />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl mb-6 flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* ─── LEFT: Shipping Form / Payment ─── */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-7">
              {step === "shipping" ? (
                <>
                  {/* Shipping Section */}
                  <div className="flex items-center gap-2 mb-6">
                    <Truck className="w-5 h-5 text-black" />
                    <h2 className="text-lg font-bold text-gray-900">Shipping Details</h2>
                    <span className="text-[10px] font-medium ml-auto px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">STEP 1 OF 2</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name <span className="text-red-400">*</span></label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2"><FieldIcon type="user" /></span>
                        <input type="text" name="shipping_name" value={shipping.shipping_name} onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-3 border ${formErrors.shipping_name ? "border-red-300 bg-red-50" : "border-gray-200"} rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black text-sm transition-all`}
                          placeholder="John Doe" />
                      </div>
                      {formErrors.shipping_name && <p className="text-xs text-red-500 mt-1">{formErrors.shipping_name}</p>}
                    </div>

                    {/* Email */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email <span className="text-red-400">*</span></label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2"><FieldIcon type="email" /></span>
                        <input type="email" name="shipping_email" value={shipping.shipping_email} onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-3 border ${formErrors.shipping_email ? "border-red-300 bg-red-50" : "border-gray-200"} rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black text-sm transition-all`}
                          placeholder="john@example.com" />
                      </div>
                      {formErrors.shipping_email && <p className="text-xs text-red-500 mt-1">{formErrors.shipping_email}</p>}
                    </div>

                    {/* Address */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Address <span className="text-red-400">*</span></label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3"><FieldIcon type="home" /></span>
                        <input type="text" name="shipping_address" value={shipping.shipping_address} onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-3 border ${formErrors.shipping_address ? "border-red-300 bg-red-50" : "border-gray-200"} rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black text-sm transition-all`}
                          placeholder="123 Main Street" />
                      </div>
                      {formErrors.shipping_address && <p className="text-xs text-red-500 mt-1">{formErrors.shipping_address}</p>}
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">City <span className="text-red-400">*</span></label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2"><FieldIcon type="city" /></span>
                        <input type="text" name="shipping_city" value={shipping.shipping_city} onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-3 border ${formErrors.shipping_city ? "border-red-300 bg-red-50" : "border-gray-200"} rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black text-sm transition-all`}
                          placeholder="Karachi" />
                      </div>
                      {formErrors.shipping_city && <p className="text-xs text-red-500 mt-1">{formErrors.shipping_city}</p>}
                    </div>

                    {/* Postal Code */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Postal Code</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2"><FieldIcon type="zip" /></span>
                        <input type="text" name="shipping_postal_code" value={shipping.shipping_postal_code} onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black text-sm transition-all"
                          placeholder="74000" />
                      </div>
                    </div>

                    {/* Country */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Country <span className="text-red-400">*</span></label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10"><FieldIcon type="world" /></span>
                        <select name="shipping_country" value={shipping.shipping_country} onChange={handleSelectChange}
                          className={`w-full pl-10 pr-10 py-3 border ${formErrors.shipping_country ? "border-red-300 bg-red-50" : "border-gray-200"} rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black text-sm transition-all appearance-none bg-white`}>
                          <option value="">Select Country</option>
                          <option value="Pakistan">🇵🇰 Pakistan</option>
                          <option value="India">🇮🇳 India</option>
                          <option value="United States">🇺🇸 United States</option>
                          <option value="United Kingdom">🇬🇧 United Kingdom</option>
                          <option value="UAE">🇦🇪 UAE</option>
                          <option value="Saudi Arabia">🇸🇦 Saudi Arabia</option>
                        </select>
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2"><ChevronDown className="w-4 h-4 text-gray-400" /></span>
                      </div>
                      {formErrors.shipping_country && <p className="text-xs text-red-500 mt-1">{formErrors.shipping_country}</p>}
                    </div>

                    {/* Promo Code */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Promo Code</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2"><FieldIcon type="tag" /></span>
                        <input type="text" name="promo_code" value={shipping.promo_code} onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black text-sm transition-all"
                          placeholder="DISCOUNT10" />
                      </div>
                      {shipping.promo_code?.toUpperCase() === "DISCOUNT10" && (
                        <p className="text-xs text-green-600 mt-1 font-medium">✅ Promo applied! $30 discount</p>
                      )}
                    </div>
                  </div>

                  {/* Continue button */}
                  <button onClick={handleContinueToPayment}
                    className="w-full bg-black hover:bg-gray-900 text-white py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 mt-6 hover:shadow-lg hover:shadow-black/20 active:scale-[0.99]">
                    Continue to Payment
                  </button>
                </>
              ) : (
                <>
                  {/* Payment Section */}
                  <div className="flex items-center gap-2 mb-6">
                    <CreditCard className="w-5 h-5 text-black" />
                    <h2 className="text-lg font-bold text-gray-900">Payment</h2>
                    <span className="text-[10px] font-medium ml-auto px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">STEP 2 OF 2</span>
                  </div>

                  {/* Shipping summary */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-700">Shipping to</span>
                      <button onClick={() => setStep("shipping")} className="text-xs text-gray-500 hover:text-black underline transition-colors">
                        Edit
                      </button>
                    </div>
                    <p className="text-gray-600">{shipping.shipping_name}</p>
                    <p className="text-gray-600">{shipping.shipping_address}, {shipping.shipping_city}</p>
                    <p className="text-gray-600">{shipping.shipping_country} {shipping.shipping_postal_code}</p>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => { setPaymentMethod("stripe"); if (!clientSecret) createPaymentIntent(); }}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          paymentMethod === "stripe" ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <CreditCard className="w-4 h-4 mb-1" />
                        <span className="font-semibold text-sm block">Credit Card</span>
                        <p className="text-xs text-gray-500">Visa, Mastercard</p>
                      </button>
                      <button
                        onClick={() => setPaymentMethod("cod")}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          paymentMethod === "cod" ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <svg className="w-4 h-4 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                        </svg>
                        <span className="font-semibold text-sm block">Cash on Delivery</span>
                        <p className="text-xs text-gray-500">Pay on arrival</p>
                      </button>
                    </div>
                  </div>

                  {/* COD Payment */}
                  {paymentMethod === "cod" && (
                    <div className="space-y-4">
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                        <p className="font-medium mb-1">💵 Cash on Delivery</p>
                        <p className="text-amber-600">Pay when your order arrives. No advance payment needed.</p>
                      </div>
                      <button
                        onClick={handleCODSubmit}
                        disabled={codProcessing}
                        className="w-full bg-black hover:bg-gray-900 text-white py-4 rounded-xl font-semibold text-base transition-all disabled:bg-gray-300 flex items-center justify-center gap-2"
                      >
                        {codProcessing ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Placing Order...
                          </>
                        ) : (
                          <>Place Order (COD)</>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Stripe payment */}
                  {paymentMethod === "stripe" && (loadingIntent ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="w-10 h-10 border-3 border-gray-200 border-t-black rounded-full animate-spin mb-4" />
                      <p className="text-sm font-medium text-gray-700">Preparing secure payment...</p>
                      <p className="text-xs text-gray-400 mt-1">Please wait</p>
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
                    <div className="text-center py-10 text-gray-400">
                      <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-50" />
                      <p>Unable to initialize payment.</p>
                      <button onClick={createPaymentIntent} className="text-black underline text-sm mt-2">
                        Try Again
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* ─── RIGHT: Order Summary ─── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-7 lg:sticky lg:top-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                  </svg>
                  Order Summary
                </h2>
                <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">{cart.length} item{cart.length !== 1 ? "s" : ""}</span>
              </div>

              {/* Cart items */}
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3 bg-gray-50 rounded-xl p-3 group hover:bg-gray-100/70 transition-all duration-200">
                    <div className="w-[65px] h-[65px] rounded-lg overflow-hidden bg-white flex-shrink-0 border border-gray-100">
                      <Image src={item.img_url} alt={item.title} width={65} height={65}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/products/product_1.png"; }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {item.size && <span className="text-[11px] bg-white px-1.5 py-0.5 rounded text-gray-500 border border-gray-200">Size: {item.size}</span>}
                        {item.color && <span className="text-[11px] bg-white px-1.5 py-0.5 rounded text-gray-500 border border-gray-200">Color: {item.color}</span>}
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="font-bold text-sm">${Number(item.price).toFixed(2)}</span>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-white border border-gray-200 rounded-lg">
                            <button onClick={() => updateQuantityInCart(item.id, -1)} className="p-1 hover:bg-gray-100 transition-colors rounded-l-lg">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-medium px-2 min-w-[16px] text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantityInCart(item.id, 1)} className="p-1 hover:bg-gray-100 transition-colors rounded-r-lg">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 className="w-3.5 h-3.5 text-red-400 hover:text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price breakdown */}
              <div className="mt-5 pt-4 border-t border-gray-100 space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Delivery</span>
                  <span className="font-medium text-gray-900">${deliveryFee.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2.5 border-t border-gray-200">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-gray-900">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-lg bg-gray-50">
                    <ShieldCheck className="w-4 h-4 mx-auto text-gray-500 mb-1" />
                    <p className="text-[10px] text-gray-500 leading-tight">Secure<br/>Checkout</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-gray-50">
                    <svg className="w-4 h-4 mx-auto text-gray-500 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                    </svg>
                    <p className="text-[10px] text-gray-500 leading-tight">Fast<br/>Delivery</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-gray-50">
                    <svg className="w-4 h-4 mx-auto text-gray-500 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-[10px] text-gray-500 leading-tight">100%<br/>Guarantee</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default Checkout;
