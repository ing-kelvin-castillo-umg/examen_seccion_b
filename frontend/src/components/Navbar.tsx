"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Package, LogIn, LayoutDashboard, LogOut, ShieldCheck, User as UserIcon } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-navy-900/95 text-white shadow-xl shadow-navy-950/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-petrol-500 to-aqua-400 flex items-center justify-center text-navy-950 shadow-lg shadow-aqua-400/20 group-hover:from-petrol-400 group-hover:to-aqua-300 transition-colors">
            <Package className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-white leading-tight">Portal UMG</span>
            <span className="text-xs text-navy-200">Segundo Parcial - Catálogo</span>
          </div>
        </Link>

        {/* Navigation / Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/products"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-aqua-100 bg-petrol-700/40 hover:bg-petrol-600/60 border border-petrol-500/30 rounded-xl transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Panel de Productos</span>
              </Link>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/10 rounded-xl text-xs font-medium text-navy-100">
                {isAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-aqua-300" />
                ) : (
                  <UserIcon className="w-4 h-4 text-petrol-300" />
                )}
                <span>{user?.username}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isAdmin ? "bg-aqua-400/20 text-aqua-200" : "bg-petrol-400/20 text-petrol-200"}`}>
                  {isAdmin ? "ADMIN" : "USER"}
                </span>
              </div>

              <button
                onClick={logout}
                title="Cerrar sesión"
                className="p-2 text-navy-200 hover:text-white hover:bg-rose-500/20 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-navy-950 bg-aqua-400 hover:bg-aqua-300 rounded-xl shadow-lg shadow-aqua-400/20 transition-all hover:-translate-y-0.5"
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
