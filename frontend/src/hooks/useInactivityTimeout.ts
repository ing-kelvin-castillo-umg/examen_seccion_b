"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { INACTIVITY_LOGOUT_MS, INACTIVITY_WARNING_MS } from "@/lib/inactivity-config";

// Eventos que cuentan como "el usuario sigue aquí". Deliberadamente son solo
// eventos de interacción real con la página (mouse/teclado/touch/scroll):
// una llamada de red en segundo plano (por ejemplo, el refresh silencioso de
// la Fase 2) NUNCA pasa por aquí, así que nunca puede reiniciar el contador
// de inactividad por error.
const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = ["mousemove", "keydown", "click", "scroll", "touchstart"];

// No queremos reiniciar el temporizador en CADA evento: un solo movimiento
// de mouse dispara decenas de eventos "mousemove" por segundo. Se ignoran
// eventos de actividad que lleguen a menos de este intervalo del último ya
// procesado (throttle simple basado en timestamp, sin dependencias nuevas).
const ACTIVITY_THROTTLE_MS = 1000;

interface UseInactivityTimeoutOptions {
  /** Se llama cuando se cumple el tiempo total de inactividad (logout). */
  onTimeout: () => void;
  /** Milisegundos de inactividad antes de mostrar el aviso. */
  warningMs?: number;
  /** Milisegundos de inactividad antes del logout automático. */
  logoutMs?: number;
  /** Si es false, el detector queda completamente apagado (sin listeners ni timers). */
  enabled?: boolean;
}

interface UseInactivityTimeoutResult {
  /** true mientras el aviso de "vas a cerrar sesión" debe mostrarse. */
  showWarning: boolean;
  /** Segundos restantes hasta el logout automático (solo relevante si showWarning es true). */
  secondsRemaining: number;
  /** Llamar cuando el usuario confirma que sigue activo (botón "Continuar sesión"). */
  continueSession: () => void;
}

export function useInactivityTimeout({
  onTimeout,
  warningMs = INACTIVITY_WARNING_MS,
  logoutMs = INACTIVITY_LOGOUT_MS,
  enabled = true,
}: UseInactivityTimeoutOptions): UseInactivityTimeoutResult {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(Math.ceil((logoutMs - warningMs) / 1000));

  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logoutAtRef = useRef<number>(0);
  const lastActivityRef = useRef<number>(0);

  // Guardamos la última versión del callback en un ref para no tener que
  // reinstalar los listeners de actividad cada vez que el componente que usa
  // el hook pasa una función inline distinta en cada render.
  const onTimeoutRef = useRef(onTimeout);
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const clearTimers = useCallback(() => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    warningTimerRef.current = null;
    logoutTimerRef.current = null;
    tickIntervalRef.current = null;
  }, []);

  const startTimers = useCallback(() => {
    clearTimers();
    setShowWarning(false);

    warningTimerRef.current = setTimeout(() => {
      logoutAtRef.current = Date.now() + (logoutMs - warningMs);
      setSecondsRemaining(Math.ceil((logoutMs - warningMs) / 1000));
      setShowWarning(true);

      // Cuenta regresiva basada en la hora real (no en un simple contador
      // decreciente), para que se autocorrija si el navegador retrasa el
      // setInterval (por ejemplo, con la pestaña en segundo plano).
      tickIntervalRef.current = setInterval(() => {
        const remaining = Math.max(0, Math.round((logoutAtRef.current - Date.now()) / 1000));
        setSecondsRemaining(remaining);
      }, 1000);
    }, warningMs);

    logoutTimerRef.current = setTimeout(() => {
      clearTimers();
      setShowWarning(false);
      onTimeoutRef.current();
    }, logoutMs);
  }, [clearTimers, warningMs, logoutMs]);

  const handleActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastActivityRef.current < ACTIVITY_THROTTLE_MS) return;
    lastActivityRef.current = now;
    startTimers();
  }, [startTimers]);

  const continueSession = useCallback(() => {
    lastActivityRef.current = Date.now();
    startTimers();
  }, [startTimers]);

  useEffect(() => {
    if (!enabled) {
      clearTimers();
      setShowWarning(false);
      return;
    }

    startTimers();
    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });

    // Limpieza: se ejecuta tanto al desmontar el componente que usa el hook
    // (por ejemplo, al salir de /dashboard) como cada vez que `enabled`
    // cambia, para no dejar listeners ni timers colgados.
    return () => {
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
      clearTimers();
    };
  }, [enabled, handleActivity, startTimers, clearTimers]);

  return { showWarning, secondsRemaining, continueSession };
}
