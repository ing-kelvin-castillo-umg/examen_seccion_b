import React from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { inactivityTimeoutSeconds } from "@/lib/server/inactivity";

// Dinámico: el tiempo de inactividad se lee de variables de entorno en cada petición (runtime, sin rebuild).
export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell timeoutSeconds={inactivityTimeoutSeconds()}>{children}</DashboardShell>;
}
