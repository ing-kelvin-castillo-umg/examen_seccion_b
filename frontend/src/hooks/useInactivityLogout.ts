"use client";

import { useEffect, useRef } from "react";

export const INACTIVITY_TIMEOUT_MS = 2 * 60 * 1000;

const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  "mousemove",
  "keydown",
  "click",
  "scroll",
  "touchstart",
];

export function useInactivityLogout(
  enabled: boolean,
  onInactive: () => Promise<void>
): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutStartedRef = useRef(false);
  const onInactiveRef = useRef(onInactive);

  useEffect(() => {
    onInactiveRef.current = onInactive;
  }, [onInactive]);

  useEffect(() => {
    if (!enabled) {
      logoutStartedRef.current = false;
      return;
    }

    const clearTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const startTimer = () => {
      if (logoutStartedRef.current) return;
      clearTimer();
      timerRef.current = setTimeout(async () => {
        if (logoutStartedRef.current) return;
        logoutStartedRef.current = true;
        await onInactiveRef.current();
      }, INACTIVITY_TIMEOUT_MS);
    };

    ACTIVITY_EVENTS.forEach((eventName) =>
      window.addEventListener(eventName, startTimer, { passive: true })
    );
    startTimer();

    return () => {
      clearTimer();
      ACTIVITY_EVENTS.forEach((eventName) =>
        window.removeEventListener(eventName, startTimer)
      );
    };
  }, [enabled]);
}
