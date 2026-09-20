"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const ACTIVITY_EVENTS = ["mousemove", "keydown", "click", "scroll", "touchstart"] as const;
const THROTTLE_MS = 1000;

interface Options {
  timeoutSeconds: number;
  warningSeconds?: number;
  enabled: boolean;
  onTimeout: () => void;
}

/**
 * Detecta inactividad del usuario. Guarda la marca de la última actividad (throttle de 1 s) y
 * calcula el tiempo restante contra el reloj, así sigue siendo exacto aunque la pestaña esté en segundo plano.
 */
export function useInactivityTimer({ timeoutSeconds, warningSeconds = 20, enabled, onTimeout }: Options) {
  const [secondsLeft, setSecondsLeft] = useState(timeoutSeconds);
  const lastActivity = useRef(Date.now());
  const lastEventAt = useRef(0);
  const fired = useRef(false);
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const reset = useCallback(() => {
    lastActivity.current = Date.now();
    setSecondsLeft(timeoutSeconds);
  }, [timeoutSeconds]);

  useEffect(() => {
    if (!enabled) return;

    fired.current = false;
    lastActivity.current = Date.now();
    setSecondsLeft(timeoutSeconds);

    const onActivity = () => {
      const now = Date.now();
      if (now - lastEventAt.current < THROTTLE_MS) return;
      lastEventAt.current = now;
      lastActivity.current = now;
    };
    // capture: true para recibir también el scroll de contenedores internos (scroll no burbujea)
    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, onActivity, { passive: true, capture: true })
    );

    const tick = () => {
      const left = Math.max(0, Math.ceil(timeoutSeconds - (Date.now() - lastActivity.current) / 1000));
      setSecondsLeft(left);
      if (left <= 0 && !fired.current) {
        fired.current = true;
        console.info("Inactividad detectada");
        onTimeoutRef.current();
      }
    };
    const id = window.setInterval(tick, 1000);

    return () => {
      window.clearInterval(id);
      ACTIVITY_EVENTS.forEach((evt) =>
        window.removeEventListener(evt, onActivity, { capture: true })
      );
    };
  }, [enabled, timeoutSeconds]);

  // Aviso en los últimos 20 s (acotado para tiempos de demostración cortos)
  const warnAt = Math.min(warningSeconds, Math.max(5, timeoutSeconds - 5));

  return { secondsLeft, warning: enabled && secondsLeft <= warnAt, reset };
}
