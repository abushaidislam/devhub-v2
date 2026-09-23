"use client";

import { WifiOff } from "lucide-react";
import { useNetwork } from "@/lib/use-network";

export function OfflineBadge() {
  const { isOnline } = useNetwork();

  if (isOnline) {
    return null;
  }

  return (
    <div
      title="You are offline. DevHub tools run locally and will continue to work."
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 8px",
        borderRadius: "9999px",
        backgroundColor: "var(--amber-2)",
        border: "1px solid var(--amber-6)",
        color: "var(--amber-11)",
        fontSize: "12px",
        fontWeight: 500,
      }}
    >
      <WifiOff size={14} />
      <span>Offline</span>
    </div>
  );
}
