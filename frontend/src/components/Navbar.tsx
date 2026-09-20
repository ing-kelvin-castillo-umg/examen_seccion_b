"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Package, LogIn, LayoutDashboard, LogOut, ShieldCheck, User as UserIcon } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-ink-950/85 text-white shadow-lg shadow-black/10 backdrop-blur-xl">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent-400/70 to-transparent" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[4.5rem] flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-3 group">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-brand-500 via-brand-600 to-accent-500 flex items-center justify-center text-white shadow-brand ring-1 ring-white/20 transition-transform group-hover:-rotate-3 group-hover:scale-105">
            <Package className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base sm:text-lg text-white leading-tight tracking-tight">
              <span className="sm:hidden">UMG</span>
              <span className="hidden sm:inline">Portal UMG</span>
            </span>
            <span className="hidden sm:block text-[11px] text-violet-200/70 uppercase tracking-[0.16em]">Catálogo inteligente</span>
          </div>
        </Link>

        {/* Navigation / Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/products"
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold text-accent-100 bg-accent-400/10 hover:bg-accent-400/20 border border-accent-300/20 rounded-xl transition-all hover:border-accent-300/40"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden md:inline">Panel de Productos</span>
              </Link>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-medium text-violet-100">
                {isAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-brand-300" />
                ) : (
                  <UserIcon className="w-4 h-4 text-accent-300" />
                )}
                <span>{user?.username}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${isAdmin ? "bg-brand-400/20 text-brand-200" : "bg-accent-400/20 text-accent-200"}`}>
                  {isAdmin ? "ADMIN" : "USER"}
                </span>
              </div>

              <button
                onClick={logout}
                title="Cerrar sesión"
                className="p-2.5 text-violet-200/70 hover:text-rose-200 hover:bg-rose-400/10 border border-transparent hover:border-rose-300/20 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-accent-600 rounded-xl shadow-brand transition-all hover:-translate-y-0.5"
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
