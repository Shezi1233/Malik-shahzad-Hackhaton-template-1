"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { api } from "@/lib/api";

interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country?: string | null;
  avatar_url?: string | null;
  is_admin: boolean;
  created_at?: string;
}

interface SignupData {
  username: string;
  email: string;
  password: string;
  full_name?: string;
}

interface IAuthContext {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signup: (data: SignupData) => Promise<void>;
  signin: (email: string, password: string) => Promise<void>;
  signout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, check for existing token
  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    if (storedToken) {
      setToken(storedToken);
      // Validate token by fetching profile
      api.get<User>("/users/profile")
        .then((userData) => {
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        })
        .catch(() => {
          // Token invalid, clear
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (data: SignupData) => {
    const result = await api.post<{ access_token: string; token_type: string; user: User }>(
      "/users/signup",
      data,
      false // no auth required
    );
    localStorage.setItem("access_token", result.access_token);
    localStorage.setItem("user", JSON.stringify(result.user));
    setToken(result.access_token);
    setUser(result.user);
  }, []);

  const signin = useCallback(async (email: string, password: string) => {
    const result = await api.post<{ access_token: string; token_type: string; user: User }>(
      "/users/signin",
      { email, password },
      false // no auth required
    );
    localStorage.setItem("access_token", result.access_token);
    localStorage.setItem("user", JSON.stringify(result.user));
    setToken(result.access_token);
    setUser(result.user);
  }, []);

  const signout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    const updated = await api.put<User>("/users/profile", data);
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, signup, signin, signout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};
