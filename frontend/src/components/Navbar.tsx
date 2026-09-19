"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Package, LogIn, LayoutDashboard, LogOut, ShieldCheck, User as UserIcon } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-dark-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-600 flex items-center justify-center text-white shadow-neon-emerald group-hover:scale-105 transition-all">
            <Package className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg text-white tracking-tight leading-tight group-hover:text-brand-400 transition-colors">
              Portal UMG
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Segundo Parcial • Sección B</span>
          </div>
        </Link>

        {/* Navigation / Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/products"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-brand-300 bg-brand-950/60 hover:bg-brand-900/80 border border-brand-500/30 rounded-xl transition-all shadow-sm hover:shadow-neon-emerald"
              >
                <LayoutDashboard className="w-4 h-4 text-brand-400" />
                <span>Panel de Productos</span>
              </Link>

              <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-dark-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300">
                {isAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-accent-400" />
                ) : (
                  <UserIcon className="w-4 h-4 text-brand-400" />
                )}
                <span>{user?.username}</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${isAdmin ? "bg-accent-950 text-accent-300 border border-accent-500/30" : "bg-brand-950 text-brand-300 border border-brand-500/30"}`}>
                  {isAdmin ? "ADMIN" : "USER"}
                </span>
              </div>

              <button
                onClick={() => logout()}
                title="Cerrar sesión"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl border border-transparent hover:border-rose-500/20 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 rounded-xl shadow-neon-emerald transition-all hover:scale-105"
            >
              <LogIn className="w-4 h-4" />
              <span>Iniciar Sesión</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

