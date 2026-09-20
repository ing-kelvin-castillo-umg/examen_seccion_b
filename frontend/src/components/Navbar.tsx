"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Package, LogIn, LayoutDashboard, LogOut, ShieldCheck, User as UserIcon } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stoneDark-800 bg-stoneDark-950/85 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-sage-600 flex items-center justify-center text-stone-100 shadow-md shadow-sage-950/40 group-hover:bg-sage-500 transition-all group-hover:scale-105">
            <Package className="w-5 h-5 text-stone-100" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base sm:text-lg text-stone-100 tracking-tight leading-tight group-hover:text-sage-300 transition-colors">
              Portal UMG
            </span>
            <span className="text-[11px] text-stone-400 font-medium">Segundo Parcial • Catálogo</span>
          </div>
        </Link>

        {/* Navigation / Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/products"
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-sage-300 bg-sage-500/15 hover:bg-sage-500/25 border border-sage-500/30 rounded-xl transition-all"
              >
                <LayoutDashboard className="w-4 h-4 text-sage-400" />
                <span>Panel Privado</span>
              </Link>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-stoneDark-900 border border-stoneDark-800 rounded-xl text-xs font-medium text-stone-300">
                {isAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-sage-400" />
                ) : (
                  <UserIcon className="w-4 h-4 text-clay-400" />
                )}
                <span>{user?.username}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isAdmin ? "bg-sage-500/20 text-sage-300 border border-sage-500/30" : "bg-clay-500/20 text-clay-300 border border-clay-500/30"}`}>
                  {isAdmin ? "ADMIN" : "USER"}
                </span>
              </div>

              <button
                onClick={() => logout()}
                title="Cerrar sesión"
                className="p-2 text-stone-400 hover:text-clay-400 hover:bg-clay-500/10 rounded-xl transition-colors border border-transparent hover:border-clay-500/20"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-stone-100 bg-sage-600 hover:bg-sage-500 rounded-xl shadow-sm shadow-sage-950/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
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
