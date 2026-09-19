"use client";

import React, { useEffect, useState } from "react";
import { MousePointer2, RefreshCw, TimerReset } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ActivityMonitor, INACTIVITY_WARNING_MS } from "@/services/activity.monitor";

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Indicador de la vigencia del access token con cuenta regresiva y botón para
 * forzar la renovación. Útil para evidenciar la política de refresh token.
 */
export const SessionStatus: React.FC = () => {
  const { tokenExpiresAt, refreshSession } = useAuth();
  const [now, setNow] = useState(() => Date.now());
  const [idleRemaining, setIdleRemaining] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(Date.now());
      setIdleRemaining(ActivityMonitor.getRemainingMs());
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!tokenExpiresAt) return null;

  const remaining = tokenExpiresAt - now;
  const expiringSoon = remaining <= 30_000;
  const idleSoon = idleRemaining !== null && idleRemaining <= INACTIVITY_WARNING_MS;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshSession();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="mb-3 space-y-1.5">
    {idleRemaining !== null && (
      <div className="px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700/60 flex items-center gap-2">
        <MousePointer2 className={`w-3.5 h-3.5 shrink-0 ${idleSoon ? "text-rose-400" : "text-slate-400"}`} />
        <div className="min-w-0 leading-tight">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Inactividad</p>
          <p className={`text-xs font-mono font-bold ${idleSoon ? "text-rose-300" : "text-slate-200"}`}>
            cierre en {formatRemaining(idleRemaining)}
          </p>
        </div>
      </div>
    )}
    <div className="px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700/60 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <TimerReset className={`w-3.5 h-3.5 shrink-0 ${expiringSoon ? "text-amber-400" : "text-slate-400"}`} />
        <div className="min-w-0 leading-tight">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Token de acceso</p>
          <p className={`text-xs font-mono font-bold ${expiringSoon ? "text-amber-300" : "text-slate-200"}`}>
            {remaining > 0 ? `expira en ${formatRemaining(remaining)}` : "renovando…"}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleRefresh}
        disabled={refreshing}
        title="Renovar token ahora"
        className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
      </button>
    </div>
    </div>
  );
};
