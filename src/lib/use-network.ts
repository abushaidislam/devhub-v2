"use client";

import { useState, useEffect } from "react";

export function useNetwork() {
  const [isOnline, setIsOnline] = useState<boolean>(true); // Assume online for SSR, sync in useEffect

  useEffect(() => {
    // Sync state on mount (client-side only)
    if (typeof navigator !== "undefined") {
      setIsOnline(navigator.onLine);
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline };
}
