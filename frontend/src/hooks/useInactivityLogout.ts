"use client";

import { useCallback, useEffect, useRef } from "react";

export const INACTIVITY_TIMEOUT_MS = 2 * 60 * 1000;

const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = [
  "mousemove",
  "mousedown",
  "keydown",
  "click",
  "scroll",
  "touchstart",
];

export function useInactivityLogout(enabled: boolean, onInactive: () => Promise<void>): void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutStartedRef = useRef(false);

  const resetTimer = useCallback(() => {
    if (!enabled || logoutStartedRef.current) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (logoutStartedRef.current) return;
      logoutStartedRef.current = true;
      void onInactive();
    }, INACTIVITY_TIMEOUT_MS);
  }, [enabled, onInactive]);

  useEffect(() => {
    if (!enabled) return;

    logoutStartedRef.current = false;
    resetTimer();
    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, resetTimer, { passive: true });
    });

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, resetTimer);
      });
    };
  }, [enabled, resetTimer]);
}
