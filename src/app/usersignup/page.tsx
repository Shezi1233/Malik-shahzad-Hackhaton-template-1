"use client";

import { useState } from "react";
import { useAuth } from "@/components/authContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GoogleSignIn from "@/components/GoogleSignIn";
import { api } from "@/lib/api";
import { Loader2, Eye, EyeOff, Check, X } from "lucide-react";

export default function UserSignup() {
  const { setAuthFromToken } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const result = await api.post<{ access_token: string; user: any }>(
        "/users/signup",
        formData,
        false
      );
      setAuthFromToken(result.access_token, result.user);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (accessToken: string) => {
    setGoogleLoading(true);
    setError("");
    try {
      const result = await api.post<{ access_token: string; user: any }>(
        "/users/google-auth",
        { access_token: accessToken },
        false
      );
      setAuthFromToken(result.access_token, result.user);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  // Password strength check
  const passwordChecks = {
    length: formData.password.length >= 6,
    hasUpper: /[A-Z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
  };
  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;

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
            Create your account and start shopping
          </p>
        </div>

        {/* Card */}
        <div className="bg-white shadow-[0_2px_20px_rgba(0,0,0,0.08)] rounded-2xl p-8">
          <h2 className="text-xl font-bold text-center mb-6">
            Create Account
          </h2>

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
            />
          </div>

          {/* Divider */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-gray-400">
                or sign up with email
              </span>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="full_name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm placeholder:text-gray-400"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm placeholder:text-gray-400"
                placeholder="johndoe"
              />
            </div>

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
                name="email"
                value={formData.email}
                onChange={handleChange}
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
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

              {/* Password strength indicator */}
              {formData.password.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          passwordStrength >= level
                            ? passwordStrength >= 3
                              ? "bg-green-500"
                              : passwordStrength >= 2
                              ? "bg-yellow-400"
                              : "bg-red-400"
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="space-y-1">
                    <PasswordCheck
                      valid={passwordChecks.length}
                      text="At least 6 characters"
                    />
                    <PasswordCheck
                      valid={passwordChecks.hasUpper}
                      text="One uppercase letter"
                    />
                    <PasswordCheck
                      valid={passwordChecks.hasNumber}
                      text="One number"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2.5 px-4 rounded-xl hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-medium text-sm flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="text-black font-semibold hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>

        {/* Footer text */}
        <p className="text-center text-xs text-gray-400 mt-6">
          By creating an account, you agree to our{" "}
          <span className="underline cursor-pointer hover:text-gray-600">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="underline cursor-pointer hover:text-gray-600">
            Privacy Policy
          </span>
        </p>
      </div>
    </div>
  );
}

function PasswordCheck({ valid, text }: { valid: boolean; text: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      {valid ? (
        <Check size={12} className="text-green-500" />
      ) : (
        <div className="w-3 h-3 rounded-full border border-gray-300" />
      )}
      <span className={valid ? "text-green-600" : "text-gray-400"}>
        {text}
      </span>
    </div>
  );
}
