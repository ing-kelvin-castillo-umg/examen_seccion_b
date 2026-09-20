"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  INACTIVITY_LOGOUT_MESSAGE_KEY,
  useAuth,
} from "@/context/AuthContext";
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

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const message = sessionStorage.getItem(INACTIVITY_LOGOUT_MESSAGE_KEY);
    if (message) {
      sessionStorage.removeItem(INACTIVITY_LOGOUT_MESSAGE_KEY);
      setInfoMessage(message);
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
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-line bg-white shadow-panel lg:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-brand-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-brand-500/10 blur-3xl" />
          <div className="relative">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-200 transition hover:text-white">
              <ChevronLeft className="h-4 w-4" />
              Volver al catálogo
            </Link>
            <div className="mt-16 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-soft">
              <Package className="h-7 w-7" />
            </div>
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-brand-300">Portal UMG</p>
            <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight">Inventario seguro y organizado.</h1>
            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-300">
              Accede al panel de productos con los permisos asignados a tu perfil institucional.
            </p>
          </div>
          <div className="relative border-t border-white/10 pt-6 text-xs leading-5 text-slate-400">
            Autenticación protegida, renovación de sesión y cierre seguro por inactividad.
          </div>
        </section>

        <section className="p-6 sm:p-10 lg:p-12">
          <Link href="/" className="mb-8 inline-flex items-center gap-1.5 text-xs font-bold text-muted transition hover:text-brand-700 lg:hidden">
            <ChevronLeft className="h-4 w-4" />
            Volver al catálogo
          </Link>

          <div className="mb-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-950 text-white lg:hidden">
              <Package className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Acceso institucional</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-brand-950">Iniciar sesión</h2>
            <p className="mt-2 text-sm leading-6 text-muted">Ingresa con tu cuenta para acceder a la gestión de productos.</p>
          </div>

          {infoMessage && (
            <div role="status" className="mb-5 flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 p-3 text-sm font-medium text-brand-900">
              <Info className="h-4 w-4 shrink-0" />
              <span>{infoMessage}</span>
            </div>
          )}

          {error && (
            <div role="alert" className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="username" className="ui-label">Usuario</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingresa tu usuario"
                  className="ui-input pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="ui-label">Contraseña</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="ui-input pl-10"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="ui-btn-primary w-full py-3">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              <span>{loading ? "Verificando..." : "Entrar al sistema"}</span>
            </button>
          </form>

          <div className="mt-8 border-t border-line pt-6">
            <span className="ui-label">Accesos disponibles</span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => fillCredentials("admin", "admin123")} className="ui-btn-secondary text-xs">
                <ShieldCheck className="h-4 w-4 text-brand-700" />
                Perfil administrador
              </button>
              <button type="button" onClick={() => fillCredentials("user", "user123")} className="ui-btn-secondary text-xs">
                <UserIcon className="h-4 w-4 text-emerald-700" />
                Perfil usuario
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
