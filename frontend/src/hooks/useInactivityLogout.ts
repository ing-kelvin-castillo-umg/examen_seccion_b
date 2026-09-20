"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_INACTIVITY_TIMEOUT_MS = 180_000;
const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = [
  "mousemove",
  "keydown",
  "click",
  "scroll",
  "touchstart",
];

interface InactivityConfig {
  timeoutMs: number;
}

interface UseInactivityLogoutOptions {
  enabled: boolean;
  onInactive: () => Promise<void>;
}

export function useInactivityLogout({ enabled, onInactive }: UseInactivityLogoutOptions): void {
  const [timeoutMs, setTimeoutMs] = useState(DEFAULT_INACTIVITY_TIMEOUT_MS);
  const logoutTriggeredRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      setTimeoutMs(DEFAULT_INACTIVITY_TIMEOUT_MS);
      return;
    }

    const controller = new AbortController();

    fetch("/api/config/inactivity", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("No fue posible obtener la configuración de inactividad");
        return response.json() as Promise<InactivityConfig>;
      })
      .then((config) => {
        if (Number.isFinite(config.timeoutMs) && config.timeoutMs > 0) {
          setTimeoutMs(config.timeoutMs);
        }
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") {
          console.warn("Se usará el timeout de inactividad por defecto:", error.message);
        }
      });

    return () => controller.abort();
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      logoutTriggeredRef.current = false;
      return;
    }

    logoutTriggeredRef.current = false;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const clearTimer = () => {
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
    };

    const handleTimeout = () => {
      timerId = null;
      if (logoutTriggeredRef.current) return;

      logoutTriggeredRef.current = true;
      void onInactive().catch((error) => {
        console.error("No fue posible completar el logout por inactividad:", error);
      });
    };

    const resetTimer = () => {
      if (logoutTriggeredRef.current) return;

      clearTimer();
      timerId = setTimeout(handleTimeout, timeoutMs);
    };

    resetTimer();
    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, resetTimer, { passive: true });
    });

    return () => {
      clearTimer();
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, resetTimer);
      });
    };
  }, [enabled, onInactive, timeoutMs]);
}
