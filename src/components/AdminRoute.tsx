"use client";

import { useAuth } from "@/components/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/signin");
      } else if (!user.is_admin) {
        router.push("/");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user || !user.is_admin) {
    return null;
  }

  return <>{children}</>;
}
