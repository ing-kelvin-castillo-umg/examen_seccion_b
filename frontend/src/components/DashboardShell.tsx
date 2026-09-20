"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useInactivityTimer } from "@/hooks/useInactivityTimer";
import { Sidebar } from "@/components/Sidebar";
import { InactivityWarning, formatCountdown } from "@/components/InactivityCountdown";
import { Clock, Loader2, Menu } from "lucide-react";

export function DashboardShell({
  children,
  timeoutSeconds,
}: {
  children: React.ReactNode;
  timeoutSeconds: number;
}) {
  const { isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { secondsLeft, warning, reset } = useInactivityTimer({
    timeoutSeconds,
    enabled: isAuthenticated,
    onTimeout: () => {
      void logout("inactivity");
    },
  });

  // Cierra el menú móvil al navegar
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-950 flex flex-col items-center justify-center text-ink-400">
        <Loader2 className="w-8 h-8 animate-spin text-brand-700 mb-3" />
        <p className="text-sm">Verificando sesión...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-ink-50 text-ink-900">
      {/* Fondo oscuro del menú móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink-950/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Left Sidebar (colapsable en móvil) */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        inactivity={{ secondsLeft, warning }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Barra superior con hamburguesa (solo móvil) */}
        <div className="md:hidden sticky top-0 z-30 flex items-center gap-3 h-14 px-4 bg-ink-900 text-white border-b border-ink-800">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={sidebarOpen}
            className="p-2 -ml-2 rounded-lg hover:bg-ink-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm tracking-tight">UMG Dashboard</span>
          <span
            className={`ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold font-mono tabular-nums ${
              warning ? "bg-accent-400 text-ink-950" : "bg-ink-800 text-ink-100"
            }`}
            aria-label="Tiempo restante de sesión"
          >
            <Clock className="w-3.5 h-3.5" />
            {formatCountdown(secondsLeft)}
          </span>
        </div>
        {children}
      </div>

      {warning && <InactivityWarning secondsLeft={secondsLeft} onStay={reset} />}
    </div>
  );
}
