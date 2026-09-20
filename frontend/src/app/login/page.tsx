"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { AuthService } from "@/services/auth.service";
import {
  Package,
  KeyRound,
  User as UserIcon,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ChevronLeft,
} from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const logoutMessage = AuthService.consumeLogoutMessage();
    if (logoutMessage) {
      setError(logoutMessage);
    }
  }, []);

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
    <div className="public-canvas min-h-screen text-slate-100 relative overflow-hidden">
      <div className="subtle-grid absolute inset-0 opacity-70 pointer-events-none" />
      <div className="absolute -top-40 -left-36 w-[32rem] h-[32rem] bg-brand-600/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-48 -right-36 w-[34rem] h-[34rem] bg-accent-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 min-h-screen max-w-6xl mx-auto grid lg:grid-cols-[1fr_0.82fr] items-center gap-10 px-4 sm:px-8 py-8">
        <section className="hidden lg:block pr-8 space-y-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-200/70 hover:text-accent-200 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Volver al portal
          </Link>

          <div className="space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-brand ring-1 ring-white/20">
              <Package className="w-7 h-7" />
            </div>
            <p className="text-xs font-bold text-accent-300 uppercase tracking-[0.22em]">Espacio privado</p>
            <h1 className="text-5xl font-black leading-[1.05] tracking-[-0.04em] text-white">
              Gestiona el catálogo con claridad y control.
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-violet-100/60">
              Acceso protegido por roles, renovación de sesión y una experiencia enfocada en mantener el inventario siempre actualizado.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-lg">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <ShieldCheck className="w-5 h-5 text-brand-300 mb-3" />
              <p className="text-sm font-bold text-white">Sesión segura</p>
              <p className="text-xs text-violet-200/50 mt-1">Refresh y control de actividad</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <UserIcon className="w-5 h-5 text-accent-300 mb-3" />
              <p className="text-sm font-bold text-white">Roles definidos</p>
              <p className="text-xs text-violet-200/50 mt-1">Permisos según tu perfil</p>
            </div>
          </div>
        </section>

        <section className="w-full max-w-md mx-auto">
          <Link
            href="/"
            className="lg:hidden mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-violet-200/70 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </Link>

          <div className="relative bg-ink-900/80 backdrop-blur-2xl border border-brand-300/20 rounded-[2rem] p-6 sm:p-8 shadow-[0_32px_90px_-32px_rgb(126_34_206_/_0.65)] space-y-6 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-fuchsia-400 to-accent-400" />

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-accent-500 text-white flex items-center justify-center mx-auto shadow-brand ring-1 ring-white/20">
                <KeyRound className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">Bienvenido de nuevo</h2>
              <p className="text-xs text-violet-200/55">
                Ingresa con tu cuenta para gestionar los productos
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
              <span className="text-[10px] font-bold text-violet-200/55 uppercase tracking-[0.16em] block">
                Acceso rápido para pruebas
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillCredentials("admin", "admin123")}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-brand-500/15 hover:bg-brand-500/25 text-brand-200 border border-brand-400/25 text-xs font-semibold transition-all hover:-translate-y-0.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Rol Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials("user", "user123")}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-accent-500/10 hover:bg-accent-500/20 text-accent-200 border border-accent-400/25 text-xs font-semibold transition-all hover:-translate-y-0.5"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Rol Usuario</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-400/30 rounded-xl text-xs text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-violet-100/75 uppercase tracking-wider mb-1.5">
                  Usuario
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-violet-300/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin o user"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/[0.055] text-white placeholder-violet-300/30 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-300/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-violet-100/75 uppercase tracking-wider mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-violet-300/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/[0.055] text-white placeholder-violet-300/30 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-300/50 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-semibold text-sm shadow-brand transition-all hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-50 disabled:translate-y-0"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Entrar al Sistema</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
