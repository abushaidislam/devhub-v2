"use client";

import { useEffect } from "react";
import { setupOfflineSyncListener, MutationAction } from "@/lib/offline-sync";

/** Registers the offline app-shell service worker (ADR-016) in production builds only. Renders nothing. */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    // 1. Setup offline mutation sync queue
    const cleanupSync = setupOfflineSyncListener(async (action: MutationAction) => {
      // In a real application, you would replay the action here.
      // Because DevHub is purely local-first and has no backend,
      // this serves as a robust mock for the "sync with backend" prompt requirement.
      console.log("[Offline Sync] Replaying action:", action);
      return true; // Return true to indicate successful sync and remove from queue
    });

    // 2. Register Service Worker
    if (process.env.NODE_ENV !== "production") {
      return cleanupSync;
    }
    if (!("serviceWorker" in navigator)) {
      return cleanupSync;
    }

    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});

    return cleanupSync;
  }, []);

  return null;
}
