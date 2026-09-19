"use client";

import React, { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { InactivityWarningModal } from "@/components/InactivityWarningModal";
import { useInactivityTimeout } from "@/hooks/useInactivityTimeout";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  const handleInactivityTimeout = useCallback(() => {
    logout("inactivity");
  }, [logout]);

  // Fase 3: el detector de inactividad SOLO vive aquí, dentro del layout
  // privado (/dashboard/**). Al montarse/desmontarse junto con este layout,
  // nunca queda activo en la landing pública ni en /login. `enabled` además
  // lo mantiene apagado mientras la sesión no esté confirmada.
  const { showWarning, secondsRemaining, continueSession } = useInactivityTimeout({
    onTimeout: handleInactivityTimeout,
    enabled: isAuthenticated,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
        <p className="text-sm">Verificando sesión...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>

      <InactivityWarningModal
        isOpen={showWarning}
        secondsRemaining={secondsRemaining}
        onContinue={continueSession}
      />
    </div>
  );
}
