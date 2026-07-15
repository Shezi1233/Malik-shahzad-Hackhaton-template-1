"use client";

import { useState } from "react";
import { useAuth } from "@/components/authContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GoogleSignIn from "@/components/GoogleSignIn";
import { api } from "@/lib/api";
import { Loader2, Eye, EyeOff, X } from "lucide-react";

export default function SignIn() {
  const { signin, setAuthFromToken } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signin(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential: string) => {
    setError("");
    try {
      const result = await api.post<{ access_token: string; user: any }>(
        "/users/google-auth",
        { id_token: credential },
        false
      );
      setAuthFromToken(result.access_token, result.user);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Google sign-in failed. Please try again.");
    }
  };

  return (
    <div className="min-h-[80vh] flex justify-center items-center px-4 py-8">
      <div className="w-full max-w-[420px]">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-black tracking-tight mb-2">
              SHOP.CO
            </h1>
          </Link>
          <p className="text-gray-500 text-sm">
            Welcome back! Sign in to your account
          </p>
        </div>

        {/* Card */}
        <div className="bg-white shadow-[0_2px_20px_rgba(0,0,0,0.08)] rounded-2xl p-8">
          <h2 className="text-xl font-bold text-center mb-6">Sign In</h2>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl mb-5 flex items-center gap-2">
              <X size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Google Sign-In */}
          <div className="mb-5">
            <GoogleSignIn
              onSuccess={handleGoogleSuccess}
              onError={setError}
              buttonText="Continue with Google"
            />
          </div>

          {/* Divider */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-gray-400">
                or sign in with email
              </span>
            </div>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm placeholder:text-gray-400"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm placeholder:text-gray-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2.5 px-4 rounded-xl hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-medium text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/usersignup"
              className="text-black font-semibold hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
