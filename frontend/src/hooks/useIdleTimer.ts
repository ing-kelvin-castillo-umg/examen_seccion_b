"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface UseIdleTimerOptions {
  timeoutSeconds?: number;
  onIdle: () => void;
  enabled?: boolean;
}

export function useIdleTimer({
  timeoutSeconds = 120, // 2 minutos por defecto
  onIdle,
  enabled = true,
}: UseIdleTimerOptions) {
  const [remainingSeconds, setRemainingSeconds] = useState(timeoutSeconds);
  const lastActivityRef = useRef<number>(Date.now());
  const onIdleRef = useRef(onIdle);

  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setRemainingSeconds(timeoutSeconds);
  }, [timeoutSeconds]);

  useEffect(() => {
    if (!enabled) {
      setRemainingSeconds(timeoutSeconds);
      return;
    }

    lastActivityRef.current = Date.now();
    setRemainingSeconds(timeoutSeconds);

    // Throttle de eventos para optimizar el rendimiento del navegador
    let lastHandledTime = 0;
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastHandledTime > 1000) { // Máximo una actualización por segundo
        lastHandledTime = now;
        lastActivityRef.current = now;
        setRemainingSeconds(timeoutSeconds);
      }
    };

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    const intervalId = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      const remaining = Math.max(0, timeoutSeconds - elapsed);
      setRemainingSeconds(remaining);

      if (remaining <= 0) {
        clearInterval(intervalId);
        onIdleRef.current();
      }
    }, 1000);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(intervalId);
    };
  }, [enabled, timeoutSeconds]);

  return { remainingSeconds, resetTimer };
}
