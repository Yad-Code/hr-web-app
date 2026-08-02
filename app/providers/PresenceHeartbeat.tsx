"use client";

import { useEffect } from "react";

export function PresenceHeartbeat({ userId }: { userId: string }) {
  useEffect(() => {
    if (!userId) return;

    // Function to send heartbeat
    const sendHeartbeat = async () => {
      try {
        await fetch("/api/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
      } catch (err) {
        console.error("Failed to send presence heartbeat", err);
      }
    };

    // Send immediately on mount
    sendHeartbeat();

    // Then send every 60 seconds while the tab is open
    const interval = setInterval(sendHeartbeat, 60000);

    return () => clearInterval(interval);
  }, [userId]);

  return null; // This component renders nothing visual
}
