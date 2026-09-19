"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Clock, LogOut, MousePointerClick } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ActivityMonitor, INACTIVITY_TIMEOUT_MS, INACTIVITY_WARNING_MS } from "@/services/activity.monitor";

const TICK_MS = 1_000;

function format(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, "0")}`;
}

/**
 * Detector de inactividad. Se monta únicamente en el área privada:
 *  - Escucha la actividad del usuario (ActivityMonitor).
 *  - INACTIVITY_WARNING_MS antes del límite muestra un modal con cuenta regresiva.
 *  - Al llegar al límite ejecuta el logout centralizado con motivo "inactivity":
 *    notifica al backend, limpia el almacenamiento y redirige al login.
 */
export const InactivityGuard: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const [remaining, setRemaining] = useState(INACTIVITY_TIMEOUT_MS);
  const [showWarning, setShowWarning] = useState(false);
  const firedRef = useRef(false);

  const stay = useCallback(() => {
    ActivityMonitor.touch(true);
    setShowWarning(false);
    setRemaining(INACTIVITY_TIMEOUT_MS);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    firedRef.current = false;
    // Cualquier interacción (incluso mover el mouse sobre el aviso) reinicia el contador.
    const unsubscribe = ActivityMonitor.subscribe(() => setRemaining(ActivityMonitor.getRemainingMs()));

    const tick = () => {
      const left = ActivityMonitor.getRemainingMs();
      setRemaining(left);

      if (left <= 0 && !firedRef.current) {
        firedRef.current = true;
        console.warn(`[INACTIVITY] ${INACTIVITY_TIMEOUT_MS / 1000}s sin actividad → cerrando sesión y notificando al backend…`);
        logout("inactivity");
        return;
      }
      setShowWarning(left > 0 && left <= INACTIVITY_WARNING_MS);
    };

    tick();
    const id = window.setInterval(tick, TICK_MS);
    return () => {
      window.clearInterval(id);
      unsubscribe();
    };
  }, [isAuthenticated, logout]);

  if (!isAuthenticated || !showWarning) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="inactivity-title"
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center space-y-4 animate-in fade-in zoom-in-95">
        <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
          <Clock className="w-7 h-7" />
        </div>
        <div>
          <h3 id="inactivity-title" className="text-lg font-bold text-slate-900">
            ¿Sigues ahí?
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Por seguridad, tu sesión se cerrará por inactividad en
          </p>
          <p className="text-4xl font-black font-mono text-amber-600 mt-2 tabular-nums">{format(remaining)}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => logout("user")}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Salir ahora
          </button>
          <button
            type="button"
            autoFocus
            onClick={stay}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/30 transition-colors"
          >
            <MousePointerClick className="w-4 h-4" />
            Seguir conectado
          </button>
        </div>
      </div>
    </div>
  );
};
