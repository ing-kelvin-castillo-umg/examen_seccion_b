"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Boxes,
  LogIn,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="group flex items-center gap-3 rounded-xl focus-visible:outline-none">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-950 text-white shadow-soft transition-colors group-hover:bg-brand-900">
            <Boxes className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold leading-tight tracking-tight text-ink sm:text-lg">
              Portal UMG
            </span>
            <span className="hidden text-xs text-muted sm:block">Catálogo institucional</span>
          </div>
        </Link>

        {/* Navigation / Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/dashboard/products"
                className="ui-btn-secondary px-3 sm:px-4"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Panel de Productos</span>
                <span className="sm:hidden">Panel</span>
              </Link>

              <div className="hidden items-center gap-2 rounded-xl border border-line bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 md:flex">
                {isAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-brand-700" />
                ) : (
                  <UserIcon className="w-4 h-4 text-emerald-600" />
                )}
                <span>{user?.username}</span>
                <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${isAdmin ? "bg-brand-100 text-brand-800" : "bg-emerald-100 text-emerald-800"}`}>
                  {isAdmin ? "ADMIN" : "USER"}
                </span>
              </div>

              <button
                onClick={logout}
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
                className="ui-icon-button hover:border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="ui-btn-primary px-4 sm:px-5"
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
