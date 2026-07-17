"use client";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { ReactNode, useMemo } from "react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface StripeProviderProps {
  clientSecret: string;
  children: ReactNode;
}

export default function StripeProvider({
  clientSecret,
  children,
}: StripeProviderProps) {
  // Memoize options to prevent re-renders
  const options = useMemo(
    () => ({
      clientSecret,
      appearance: {
        theme: "stripe" as const,
        variables: {
          colorPrimary: "#000000",
          colorBackground: "#ffffff",
          colorText: "#1a1a1a",
          colorDanger: "#ef4444",
          fontFamily: "Inter, system-ui, sans-serif",
          borderRadius: "12px",
          spacingUnit: "4px",
        },
        rules: {
          ".Input": {
            border: "1px solid #e5e7eb",
            padding: "12px 16px",
            borderRadius: "12px",
          },
          ".Input:focus": {
            border: "1px solid #000",
            boxShadow: "0 0 0 1px #000",
          },
        },
      },
    }),
    [clientSecret]
  );

  if (!clientSecret) return null;

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}
