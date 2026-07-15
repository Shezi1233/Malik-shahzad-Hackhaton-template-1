"use client";

import { useEffect, useRef, useState } from "react";
import { FcGoogle } from "react-icons/fc";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            cancel_on_tap_outside?: boolean;
            auto_select?: boolean;
          }) => void;
          prompt: (
            momentListener?: (notification: {
              isDisplayMoment: () => boolean;
              isNotDisplayed: () => boolean;
              isSkippedMoment: () => boolean;
              getNotDisplayedReason: () => string;
              getSkippedReason: () => string;
            }) => void
          ) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, unknown>
          ) => void;
        };
      };
    };
  }
}

interface GoogleSignInProps {
  onSuccess: (credential: string) => Promise<void> | void;
  onError?: (message: string) => void;
  buttonText?: string;
}

export default function GoogleSignIn({
  onSuccess,
  onError,
  buttonText = "Continue with Google",
}: GoogleSignInProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const [loading, setLoading] = useState(false);
  const initialized = useRef(false);
  const onSuccessRef = useRef(onSuccess);

  // Keep callback ref fresh
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    if (!clientId || initialized.current) return;
    initialized.current = true;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {};
    script.onerror = () => {
      onError?.("Failed to load Google sign-in. Please try again.");
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup script (only if we added it)
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, [clientId, onError]);

  if (!clientId) {
    return null; // Hide button if not configured
  }

  const handleGoogleSignIn = () => {
    if (!window.google?.accounts) {
      onError?.("Google sign-in is still loading. Please try again.");
      return;
    }

    setLoading(true);

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        setLoading(false);
        if (response?.credential) {
          onSuccessRef.current(response.credential);
        } else {
          onError?.("Sign-in cancelled. Please try again.");
        }
      },
      cancel_on_tap_outside: false,
    });

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed()) {
        setLoading(false);
        onError?.(
          "Popup blocked or Google sign-in unavailable. Please try another method."
        );
      }
      if (notification.isSkippedMoment()) {
        setLoading(false);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-gray-700 font-medium"
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      ) : (
        <FcGoogle className="text-xl" />
      )}
      {loading ? "Connecting..." : buttonText}
    </button>
  );
}
