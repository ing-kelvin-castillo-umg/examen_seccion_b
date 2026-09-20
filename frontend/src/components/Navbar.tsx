"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Package, LogIn, LayoutDashboard, LogOut, ShieldCheck, User as UserIcon } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-ink-900/90 text-white shadow-lg shadow-ink-900/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white shadow-brand group-hover:from-brand-300 group-hover:to-brand-500 transition-colors">
            <Package className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-white leading-tight">Portal UMG</span>
            <span className="text-xs text-ink-300">Tecnología que conecta</span>
          </div>
        </Link>

        {/* Navigation / Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/products"
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold text-brand-100 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-400/20 rounded-xl transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Panel de Productos</span>
              </Link>

              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-medium text-ink-200">
                {isAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                ) : (
                  <UserIcon className="w-4 h-4 text-brand-300" />
                )}
                <span>{user?.username}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isAdmin ? "bg-sky-400/15 text-sky-300" : "bg-brand-400/15 text-brand-200"}`}>
                  {isAdmin ? "ADMIN" : "USER"}
                </span>
              </div>

              <button
                onClick={logout}
                title="Cerrar sesión"
                className="p-2 text-ink-300 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-ink-950 bg-brand-400 hover:bg-brand-300 rounded-xl shadow-brand transition-all"
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
