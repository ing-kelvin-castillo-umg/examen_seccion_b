"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Package,
  KeyRound,
  User as UserIcon,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Info,
  Loader2,
  ChevronLeft,
} from "lucide-react";

const SESSION_NOTICE_MESSAGES: Record<string, string> = {
  session_expired: "Tu sesión expiró. Inicia sesión nuevamente.",
  inactivity: "Sesión cerrada por inactividad.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionNotice = SESSION_NOTICE_MESSAGES[searchParams.get("reason") || ""];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Por favor completa todos los campos requeridos.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(username, password);
      router.push("/dashboard/products");
    } catch (err: any) {
      setError(err.message || "Usuario o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 bg-dark-950 text-slate-100 relative overflow-hidden">
      {/* Background ambient glowing orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-500/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent-500/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />

      {/* Back to Home Link */}
      <div className="w-full max-w-md mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-brand-400 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Volver al Catálogo Principal</span>
        </Link>
      </div>

      {/* Login Card (Cyber Glassmorphism) */}
      <div className="w-full max-w-md glass-panel rounded-3xl p-8 shadow-neon-emerald border border-slate-800/80 space-y-6 relative z-10">
        {/* Top glowing line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[2px] bg-gradient-to-r from-transparent via-brand-400 to-transparent" />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-accent-600 text-white flex items-center justify-center mx-auto shadow-neon-emerald">
            <Package className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white pt-1">Acceso al Sistema</h2>
          <p className="text-xs text-slate-400">
            Ingresa tus credenciales para la gestión centralizada de productos
          </p>
        </div>

        {/* Quick Fill Credentials Buttons */}
        <div className="p-3.5 rounded-2xl bg-dark-900/80 border border-slate-800 space-y-2.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
            ⚡ Acceso Rápido para Evaluación
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => fillCredentials("admin", "admin123")}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-accent-950/40 hover:bg-accent-900/60 text-accent-300 border border-accent-500/30 text-xs font-bold transition-all hover:scale-[1.02] shadow-sm hover:shadow-neon-violet"
            >
              <ShieldCheck className="w-4 h-4 text-accent-400" />
              <span>Rol Admin</span>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials("user", "user123")}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-brand-950/40 hover:bg-brand-900/60 text-brand-300 border border-brand-500/30 text-xs font-bold transition-all hover:scale-[1.02] shadow-sm hover:shadow-neon-emerald"
            >
              <UserIcon className="w-4 h-4 text-brand-400" />
              <span>Rol Usuario</span>
            </button>
          </div>
        </div>

        {/* Session Notice */}
        {sessionNotice && !error && (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center gap-2.5 animate-in fade-in">
            <Info className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="font-medium">{sessionNotice}</span>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Nombre de Usuario
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin o user"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-dark-900/90 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/60 focus:border-brand-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-dark-900/90 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/60 focus:border-brand-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-bold text-sm shadow-neon-emerald transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Iniciar Sesión en el Panel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
