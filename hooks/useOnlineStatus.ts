"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export function useOnlineStatus(clerkId: string | undefined) {
  const setOnlineStatus = useMutation(api.users.setOnlineStatus);

  useEffect(() => {
    if (!clerkId) return;

    setOnlineStatus({ clerkId, isOnline: true });

    const handleVisibilityChange = () => {
      setOnlineStatus({ clerkId, isOnline: !document.hidden });
    };

    const handleBeforeUnload = () => {
      setOnlineStatus({ clerkId, isOnline: false });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Heartbeat every 30s
    const interval = setInterval(() => {
      if (!document.hidden) {
        setOnlineStatus({ clerkId, isOnline: true });
      }
    }, 30000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearInterval(interval);
      setOnlineStatus({ clerkId, isOnline: false });
    };
  }, [clerkId, setOnlineStatus]);
}
