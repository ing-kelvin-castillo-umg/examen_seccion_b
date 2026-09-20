"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-brand-950 text-slate-300">
        <Loader2 className="mb-3 h-8 w-8 animate-spin text-brand-300" />
        <p className="text-sm">Verificando sesión...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink lg:flex-row">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="min-w-0 flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
