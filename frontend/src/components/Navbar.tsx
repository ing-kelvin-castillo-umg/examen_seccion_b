"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Package, LogIn, LayoutDashboard, LogOut, ShieldCheck, User as UserIcon } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-midnight-800/80 bg-midnight-950/90 text-white backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-midnight-950 shadow-md shadow-brand-500/20 group-hover:bg-brand-400 transition-colors">
            <Package className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-white leading-tight">Portal UMG</span>
            <span className="text-xs text-brand-200">Segundo Parcial · Catálogo</span>
          </div>
        </Link>

        {/* Navigation / Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/products"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-900 bg-brand-100 hover:bg-brand-200 rounded-lg transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Panel de Productos</span>
              </Link>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-midnight-900 rounded-lg text-xs font-medium text-brand-100 border border-midnight-700">
                {isAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-coral-300" />
                ) : (
                  <UserIcon className="w-4 h-4 text-brand-300" />
                )}
                <span>{user?.username}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isAdmin ? "bg-coral-100 text-coral-700" : "bg-brand-100 text-brand-800"}`}>
                  {isAdmin ? "ADMIN" : "USER"}
                </span>
              </div>

              <button
                onClick={() => void logout()}
                title="Cerrar sesión"
              className="p-2 text-brand-200 hover:text-white hover:bg-coral-600/80 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-midnight-950 bg-brand-300 hover:bg-brand-200 rounded-lg shadow-sm shadow-brand-500/20 transition-all hover:shadow-md hover:shadow-brand-500/30"
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
