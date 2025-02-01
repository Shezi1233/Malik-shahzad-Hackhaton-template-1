// components/LoadingBar.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

const LoadingBar = () => {
  const pathname = usePathname();

  useEffect(() => {
    NProgress.start(); // Start progress bar
    const timeout = setTimeout(() => NProgress.done(), 500); // Simulate loading delay

    return () => {
      clearTimeout(timeout);
      NProgress.done(); // Ensure progress bar is stopped
    };
  }, [pathname]);

  return null; // No need to render anything
};

export default LoadingBar;