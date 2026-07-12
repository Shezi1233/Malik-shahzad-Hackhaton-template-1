// components/LoadingBar.tsx
"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

const LoadingBar = () => {
  const pathname = usePathname();
  const prevPath = useRef(pathname);

  useEffect(() => {
    // Only trigger on actual route changes, not first mount
    if (prevPath.current !== pathname) {
      NProgress.configure({ showSpinner: false, minimum: 0.1 });
      NProgress.start();
      // Complete immediately — Next.js handles the actual loading
      NProgress.done();
      prevPath.current = pathname;
    }
    // No forced artificial delay
  }, [pathname]);

  return null;
};

export default LoadingBar;