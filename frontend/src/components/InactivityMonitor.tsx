"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

// Entre 2 y 5 minutos según el enunciado; configurable para pruebas.
const INACTIVITY_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_INACTIVITY_TIMEOUT_MS) || 3 * 60 * 1000;

// Eventos que cuentan como "actividad del usuario".
const ACTIVITY_EVENTS = ["mousemove", "keydown", "click", "scroll", "touchstart"] as const;

// Evita reprogramar el timer en cada uno de los eventos (mousemove dispara decenas por segundo).
const RESET_THROTTLE_MS = 1000;

export function InactivityMonitor() {
  const { isAuthenticated, logout } = useAuth();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastResetAtRef = useRef(0);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const clearPendingTimeout = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const handleInactivityTimeout = () => {
      clearPendingTimeout();
      logout("inactivity");
    };

    const scheduleTimeout = () => {
      clearPendingTimeout();
      timeoutRef.current = setTimeout(handleInactivityTimeout, INACTIVITY_TIMEOUT_MS);
    };

    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastResetAtRef.current < RESET_THROTTLE_MS) {
        return;
      }
      lastResetAtRef.current = now;
      scheduleTimeout();
    };

    scheduleTimeout();
    ACTIVITY_EVENTS.forEach((eventName) =>
      window.addEventListener(eventName, handleUserActivity, { passive: true })
    );

    return () => {
      clearPendingTimeout();
      ACTIVITY_EVENTS.forEach((eventName) => window.removeEventListener(eventName, handleUserActivity));
    };
  }, [isAuthenticated, logout]);

  return null;
}
