"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [resetToken, setResetToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api.post<{ message: string; reset_token?: string }>(
        "/users/forgot-password",
        { email },
        false
      );
      setSent(true);
      if (data.reset_token) {
        setResetToken(data.reset_token);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex justify-center items-center px-4 py-8">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-black tracking-tight mb-2">SHOP.CO</h1>
          </Link>
          <p className="text-gray-500 text-sm">Reset your password</p>
        </div>

        <div className="bg-white shadow-[0_2px_20px_rgba(0,0,0,0.08)] rounded-2xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold mb-2">Check Your Email</h2>
              <p className="text-sm text-gray-500 mb-4">
                If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link.
              </p>
              {resetToken && (
                <div className="bg-gray-50 rounded-xl p-4 mb-4 text-left">
                  <p className="text-xs text-gray-400 mb-1">Development Mode — Reset Token:</p>
                  <p className="text-xs font-mono text-gray-600 break-all">{resetToken}</p>
                  <Link
                    href={`/reset-password?token=${resetToken}`}
                    className="mt-2 inline-block bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
                  >
                    Reset Password →
                  </Link>
                </div>
              )}
              <Link href="/signin" className="text-sm text-gray-500 hover:text-black flex items-center justify-center gap-1 mt-4">
                <ArrowLeft className="w-3 h-3" /> Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-center mb-2">Forgot Password?</h2>
              <p className="text-sm text-gray-500 text-center mb-6">
                No worries! Enter your email and we&apos;ll send you a reset link.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl mb-4">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-2.5 rounded-xl hover:bg-gray-800 disabled:bg-gray-400 font-medium text-sm flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Remember your password?{" "}
                <Link href="/signin" className="text-black font-semibold hover:underline">Sign In</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
