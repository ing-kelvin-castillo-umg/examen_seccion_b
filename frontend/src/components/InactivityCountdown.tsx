"use client";

import React from "react";
import { AlertTriangle, Clock } from "lucide-react";

export function formatCountdown(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface CountdownProps {
  secondsLeft: number;
  warning: boolean;
}

/** Temporizador visible de la sesión (Sidebar). Cambia a ámbar y pulsa en el tramo de aviso. */
export const InactivityCountdown: React.FC<CountdownProps> = ({ secondsLeft, warning }) => (
  <div
    role="timer"
    aria-label="Tiempo restante antes del cierre de sesión por inactividad"
    className={`flex items-center justify-between gap-2 px-3 py-2 mb-3 rounded-lg border text-xs font-semibold transition-colors ${
      warning
        ? "bg-accent-400 text-ink-950 border-accent-300 animate-pulse"
        : "bg-ink-800 text-ink-100 border-ink-700"
    }`}
  >
    <span className="flex items-center gap-1.5">
      <Clock className="w-3.5 h-3.5" />
      Sesión expira en
    </span>
    <span className="font-mono tabular-nums">{formatCountdown(secondsLeft)}</span>
  </div>
);

interface WarningProps {
  secondsLeft: number;
  onStay: () => void;
}

/** Aviso en los últimos segundos antes de cerrar la sesión por inactividad. */
export const InactivityWarning: React.FC<WarningProps> = ({ secondsLeft, onStay }) => (
  <div
    role="alert"
    aria-live="assertive"
    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-md flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border border-accent-500 bg-accent-400 text-ink-950"
  >
    <AlertTriangle className="w-5 h-5 shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold">Tu sesión está por cerrarse</p>
      <p className="text-xs">
        Se cerrará por inactividad en {secondsLeft} s. Mueve el mouse o presiona una tecla para continuar.
      </p>
    </div>
    <button
      type="button"
      onClick={onStay}
      className="shrink-0 px-3 py-1.5 rounded-lg bg-ink-900 hover:bg-ink-800 text-white text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-950 focus-visible:ring-offset-2 focus-visible:ring-offset-accent-400"
    >
      Seguir conectado
    </button>
  </div>
);
