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
  const options = useMemo(
    () => ({
      clientSecret,
      appearance: {
        theme: "stripe" as const,
        variables: {
          colorPrimary: "#000000",
          colorBackground: "#ffffff",
          colorText: "#111827",
          colorDanger: "#ef4444",
          fontFamily: "Inter, system-ui, -apple-system, sans-serif",
          borderRadius: "10px",
          spacingUnit: "4px",
          colorTextSecondary: "#6b7280",
          colorIcon: "#9ca3af",
          colorIconCardBrand: "#000000",
          colorTextPlaceholder: "#9ca3af",
          tabColorSelected: "#000000",
        },
        rules: {
          ".Input": {
            border: "1.5px solid #e5e7eb",
            padding: "14px 16px",
            borderRadius: "10px",
            fontSize: "15px",
            transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            backgroundColor: "#ffffff",
            boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
          },
          ".Input:hover": {
            border: "1.5px solid #d1d5db",
          },
          ".Input:focus": {
            border: "1.5px solid #000",
            boxShadow: "0 0 0 3px rgba(0,0,0,0.08)",
          },
          ".Input--invalid": {
            border: "1.5px solid #ef4444",
            boxShadow: "0 0 0 3px rgba(239,68,68,0.1)",
          },
          ".Label": {
            fontSize: "13px",
            fontWeight: "600",
            color: "#374151",
            marginBottom: "6px",
          },
          ".Tab": {
            padding: "12px 16px",
            border: "1.5px solid #e5e7eb",
            borderRadius: "10px",
            backgroundColor: "#ffffff",
            transition: "all 0.2s ease",
          },
          ".Tab:hover": {
            border: "1.5px solid #000",
            backgroundColor: "#fafafa",
          },
          ".Tab--selected": {
            border: "1.5px solid #000",
            backgroundColor: "#fafafa",
            boxShadow: "0 0 0 3px rgba(0,0,0,0.06)",
          },
          ".TabLabel": {
            fontSize: "14px",
            fontWeight: "600",
            color: "#111827",
          },
          ".TabIcon": {
            color: "#000",
          },
          ".Error": {
            fontSize: "13px",
            color: "#ef4444",
            marginTop: "8px",
          },
          ".Icon": {
            color: "#9ca3af",
          },
          ".Icon--selected": {
            color: "#000",
          },
          ".PickerItem": {
            border: "1.5px solid #e5e7eb",
            borderRadius: "10px",
            padding: "12px",
            transition: "all 0.2s ease",
          },
          ".PickerItem--selected": {
            border: "1.5px solid #000",
            boxShadow: "0 0 0 3px rgba(0,0,0,0.06)",
          },
          ".AccordionItem": {
            border: "1.5px solid #e5e7eb",
            borderRadius: "10px",
            overflow: "hidden",
          },
          ".AccordionHeader": {
            padding: "12px 16px",
            fontWeight: "500",
          },
          ".AccordionContent": {
            padding: "0 16px 16px",
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
