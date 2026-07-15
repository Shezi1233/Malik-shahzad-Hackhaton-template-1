"use client";

import { useEffect, useRef, useState } from "react";
import { FcGoogle } from "react-icons/fc";

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: {
              access_token?: string;
              id_token?: string;
              error?: string;
            }) => void;
            error_callback?: (error: { message: string }) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
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
  const scriptLoaded = useRef(false);
  const onSuccessRef = useRef(onSuccess);

  // Keep callback ref fresh
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    if (!clientId || scriptLoaded.current) return;
    scriptLoaded.current = true;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      onError?.("Failed to load Google sign-in. Please try again.");
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, [clientId, onError]);

  if (!clientId) {
    return null;
  }

  const handleGoogleSignIn = () => {
    if (!window.google?.accounts) {
      onError?.("Google sign-in is still loading. Please try again.");
      return;
    }

    setLoading(true);

    // Use OAuth 2.0 Token Client for proper popup flow
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "openid email profile",
      callback: (response) => {
        setLoading(false);
        if (response?.id_token) {
          // Backend expects the id_token
          onSuccessRef.current(response.id_token);
        } else if (response?.error === "user_cancelled") {
          // User closed the popup — not an error, just cancelled
          // Don't show any error message for this
        } else if (response?.error) {
          onError?.("Google sign-in cancelled.");
        } else {
          onError?.("Google sign-in failed. Please try again.");
        }
      },
    });

    // This opens the Google account selector popup
    client.requestAccessToken();
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-gray-700 font-medium"
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
