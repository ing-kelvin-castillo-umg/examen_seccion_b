"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { INACTIVITY_TIMEOUT_MS, useAuth } from "@/context/AuthContext";
import {
  Package,
  Boxes,
  LogOut,
  Home,
  Clock3,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, isAdmin, logout, inactivitySecondsRemaining } = useAuth();

  const formatRemainingTime = (totalSeconds: number | null): string => {
    const defaultSeconds = Math.ceil(INACTIVITY_TIMEOUT_MS / 1000);
    const safeSeconds = Math.max(0, totalSeconds ?? defaultSeconds);
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const navItems = [
    {
      name: "Productos",
      href: "/dashboard/products",
      icon: Boxes,
    },
  ];

  return (
    <aside className="sticky top-0 z-30 flex w-full shrink-0 flex-col border-b border-brand-900 bg-brand-950 text-slate-200 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r">
      {/* Brand Header */}
      <div className="flex items-center gap-3 border-b border-white/10 p-4 lg:p-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500 text-white shadow-soft">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-extrabold leading-none tracking-tight text-white">
            Portal UMG
          </h2>
          <span className="text-xs text-brand-200">Panel de administración</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex items-center gap-2 p-3 lg:block lg:flex-1 lg:space-y-1.5 lg:px-4 lg:py-6">
        <p className="hidden px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 lg:block">
          Módulos del Sistema
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition lg:justify-start lg:gap-3 lg:px-3.5 ${
                isActive
                  ? "bg-brand-500 text-white shadow-soft"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <div className="flex-1 lg:my-4 lg:border-t lg:border-white/10 lg:pt-4">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white lg:justify-start lg:gap-3 lg:px-3.5"
          >
            <Home className="w-5 h-5 shrink-0" />
            <span className="hidden sm:inline">Catálogo público</span>
            <span className="sm:hidden">Inicio</span>
          </Link>
        </div>
      </nav>

      {/* User Profile Footer */}
      <div className="flex flex-wrap items-center gap-3 border-t border-white/10 bg-black/10 p-3 lg:block lg:p-4">
        <div className="flex min-w-0 flex-1 items-center justify-between gap-3 lg:mb-4">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white ${isAdmin ? "bg-brand-600 ring-1 ring-brand-300" : "bg-emerald-700 ring-1 ring-emerald-400"}`}>
              {user?.username?.slice(0, 2).toUpperCase() || "US"}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">
                {user?.fullName || user?.username}
              </p>
              <p className="truncate text-[11px] text-slate-400">
                @{user?.username}
              </p>
            </div>
          </div>
          <span
            className={`hidden shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide sm:inline-flex ${
              isAdmin
                ? "border border-brand-400/30 bg-brand-500/15 text-brand-200"
                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
            }`}
          >
            {isAdmin ? "Admin" : "User"}
          </span>
        </div>

        <div className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] px-2.5 py-2 text-[11px] font-medium text-slate-300 lg:mb-3 lg:w-full">
          <Clock3 className="w-3.5 h-3.5" />
          <span>
            Cierre por inactividad en {formatRemainingTime(inactivitySecondsRemaining)}
          </span>
        </div>

        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 transition hover:border-red-500 hover:bg-red-700 hover:text-white lg:w-full"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
