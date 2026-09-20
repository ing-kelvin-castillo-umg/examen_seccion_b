"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Package,
  Boxes,
  LogOut,
  ShieldCheck,
  User as UserIcon,
  Home,
  Clock,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, isAdmin, logout, remainingIdleSeconds } = useAuth();

  const navItems = [
    {
      name: "Inventario de Productos",
      href: "/dashboard/products",
      icon: Boxes,
    },
  ];

  return (
    <aside className="w-64 bg-stoneDark-950 text-stone-200 flex flex-col shrink-0 min-h-screen border-r border-stoneDark-800 transition-colors">
      {/* Brand Header */}
      <div className="p-6 border-b border-stoneDark-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-sage-600 flex items-center justify-center text-stone-100 shadow-md shadow-sage-950/40">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-stone-100 text-base tracking-tight leading-none">
            UMG Dashboard
          </h2>
          <span className="text-[11px] text-stone-400 font-medium">Segundo Parcial</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        <p className="px-3 pb-2 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
          Módulos Principales
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-sage-600 text-stone-100 shadow-sm shadow-sage-950/40 font-semibold"
                  : "text-stone-400 hover:bg-stoneDark-900 hover:text-stone-200"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0 text-stone-200" />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-4 border-t border-stoneDark-800/80 my-4">
          <Link
            href="/"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-stone-400 hover:bg-stoneDark-900 hover:text-stone-200 transition-all"
          >
            <Home className="w-5 h-5 shrink-0" />
            <span>Ver Catálogo Público</span>
          </Link>
        </div>
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-stoneDark-800 bg-stoneDark-900/60">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-stone-100 font-semibold text-xs shrink-0 ${
                isAdmin
                  ? "bg-sage-600 ring-2 ring-sage-400/40"
                  : "bg-clay-600 ring-2 ring-clay-400/40"
              }`}
            >
              {user?.username?.slice(0, 2).toUpperCase() || "US"}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-stone-100 truncate">
                {user?.fullName || user?.username}
              </p>
              <p className="text-[11px] text-stone-400 truncate">
                @{user?.username}
              </p>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 uppercase tracking-wide ${
              isAdmin
                ? "bg-sage-500/20 text-sage-300 border border-sage-500/30"
                : "bg-clay-500/20 text-clay-300 border border-clay-500/30"
            }`}
          >
            {isAdmin ? "Admin" : "User"}
          </span>
        </div>

        {/* Temporizador de Inactividad (Evidencia Fase 3 y 4) */}
        <div className="p-2.5 bg-stoneDark-950/80 rounded-xl border border-stoneDark-800 space-y-1.5 mb-3">
          <div className="flex items-center justify-between text-[11px] font-semibold text-stone-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-clay-400" />
              <span>Inactividad</span>
            </span>
            <span
              className={`font-mono text-xs font-bold ${
                remainingIdleSeconds <= 30
                  ? "text-clay-400 animate-pulse"
                  : "text-sage-300"
              }`}
            >
              {Math.floor(remainingIdleSeconds / 60).toString().padStart(2, "0")}:
              {(remainingIdleSeconds % 60).toString().padStart(2, "0")}
            </span>
          </div>
          <div className="w-full bg-stoneDark-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                remainingIdleSeconds <= 30 ? "bg-clay-500" : "bg-sage-400"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, (remainingIdleSeconds / 120) * 100))}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-clay-400 hover:text-stone-100 bg-clay-500/10 hover:bg-clay-600 rounded-xl transition-all border border-clay-500/20 hover:border-transparent"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
