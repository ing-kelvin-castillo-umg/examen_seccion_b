import { useEffect, useRef, useCallback } from "react";

interface UseInactivityLogoutProps {
  enabled: boolean;
  onInactive: () => void;
  timeoutMs?: number;
}

const DEFAULT_INACTIVITY_TIMEOUT_MS = 180_000; // 3 minutes

export function useInactivityLogout({
  enabled,
  onInactive,
  timeoutMs = DEFAULT_INACTIVITY_TIMEOUT_MS,
}: UseInactivityLogoutProps) {
  const lastActivityRef = useRef<number>(Date.now());
  const onInactiveStable = useCallback(onInactive, [onInactive]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    lastActivityRef.current = Date.now();

    const handleActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        if (Date.now() - lastActivityRef.current >= timeoutMs) {
          onInactiveStable();
        }
      }
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, handleActivity));
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const intervalId = setInterval(() => {
      if (Date.now() - lastActivityRef.current >= timeoutMs) {
        onInactiveStable();
      }
    }, 1000); // Check every 1 second

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [enabled, timeoutMs, onInactiveStable]);
}
