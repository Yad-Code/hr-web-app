// @/app/providers/PresenceHeartbeat.tsx
"use client";

import { useEffect, useRef } from "react";

export function PresenceHeartbeat({ userId }: { userId: string }) {
  // Use a ref to persist the last ping time across rapid re-renders
  const lastPingTime = useRef<number>(0);

  useEffect(() => {
    if (!userId) return;

    const sendHeartbeat = async (status: "Active" | "Offline" = "Active") => {
      const now = Date.now();

      // Throttle 'Active' database pings to a strict maximum of once every 45 seconds.
      // This completely eliminates database locks caused by rapid page navigation.
      if (status === "Active" && now - lastPingTime.current < 45000) {
        return;
      }

      lastPingTime.current = now;

      try {
        if (status === "Offline" && navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify({ userId, status })], {
            type: "application/json",
          });
          navigator.sendBeacon("/api/presence", blob);
        } else {
          await fetch("/api/presence", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, status }),
            keepalive: true,
          });
        }
      } catch (err) {
        console.error("Failed to send presence heartbeat", err);
      }
    };

    // 1. Send immediately on mount (will be ignored if navigating quickly)
    sendHeartbeat("Active");

    // 2. Interval ping for users sitting idle on a page
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        sendHeartbeat("Active");
      }
    }, 60000);

    // 3. Tab visibility return
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        sendHeartbeat("Active");
      }
    };

    // 4. Send instant "Offline" signal ONLY when closing the browser tab
    const handleBeforeUnload = () => {
      sendHeartbeat("Offline");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
 
    };
  }, [userId]);

  return null;
}
