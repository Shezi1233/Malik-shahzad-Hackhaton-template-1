"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";
import { Lock, Eye, EyeOff, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Suspense } from "react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("No reset token provided. Please use the link from your email.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("No reset token provided.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      await api.post<{ message: string }>(
        "/users/reset-password",
        { token, new_password: password },
        false
      );
      setSuccess(true);
      setTimeout(() => router.push("/signin"), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-xl font-bold mb-2">Password Reset!</h2>
        <p className="text-sm text-gray-500 mb-4">Your password has been updated successfully. Redirecting to sign in...</p>
        <Link href="/signin" className="text-sm text-black font-semibold hover:underline">Sign In Now</Link>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-xl font-bold text-center mb-2">Set New Password</h2>
      <p className="text-sm text-gray-500 text-center mb-6">Enter your new password below.</p>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl mb-4 flex items-start gap-2">
          <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !token}
          className="w-full bg-black text-white py-2.5 rounded-xl hover:bg-gray-800 disabled:bg-gray-400 font-medium text-sm flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        <Link href="/signin" className="text-black font-semibold hover:underline">Back to Sign In</Link>
      </p>
    </>
  );
}

export default function ResetPassword() {
  return (
    <div className="min-h-[80vh] flex justify-center items-center px-4 py-8">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-black tracking-tight mb-2">SHOP.CO</h1>
          </Link>
        </div>
        <div className="bg-white shadow-[0_2px_20px_rgba(0,0,0,0.08)] rounded-2xl p-8">
          <Suspense fallback={
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          }>
            <ResetPasswordContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
