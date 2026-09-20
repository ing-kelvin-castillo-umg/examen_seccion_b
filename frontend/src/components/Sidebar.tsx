"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Package,
  Boxes,
  LogOut,
  ShieldAlert,
  User as UserIcon,
  Home,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();

  const navItems = [
    {
      name: "Productos",
      href: "/dashboard/products",
      icon: Boxes,
    },
  ];

  return (
    // Fase 4 (responsive): riel de solo-iconos por debajo de `sm` (375px),
    // ancho completo con etiquetas desde `sm` (768px+). Antes el sidebar
    // tenía w-64 fijo, que en 375px dejaba ~119px para el contenido — un
    // problema real de responsive, no solo de color.
    <aside className="w-20 sm:w-64 bg-primary-950 text-neutral-200 flex flex-col shrink-0 min-h-screen border-r border-primary-900 transition-all">
      {/* Brand Header */}
      <div className="p-4 sm:p-6 border-b border-primary-900 flex items-center justify-center sm:justify-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/20 shrink-0">
          <Package className="w-5 h-5" />
        </div>
        <div className="hidden sm:block">
          <h2 className="font-bold text-white text-base tracking-tight leading-none">
            UMG Dashboard
          </h2>
          <span className="text-xs text-neutral-400">Examen Parcial</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2 sm:px-4 py-6 space-y-1.5">
        <p className="hidden sm:block px-3 pb-2 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
          Módulos del Sistema
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              title={item.name}
              className={`flex items-center justify-center sm:justify-start gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 ${
                isActive
                  ? "bg-primary-600 text-white shadow-md shadow-primary-600/30"
                  : "text-neutral-300 hover:bg-primary-900 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="hidden sm:inline">{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-4 border-t border-primary-900/80 my-4">
          <Link
            href="/"
            title="Ver Catálogo Público"
            className="flex items-center justify-center sm:justify-start gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:bg-primary-900 hover:text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
          >
            <Home className="w-5 h-5 shrink-0" />
            <span className="hidden sm:inline">Ver Catálogo Público</span>
          </Link>
        </div>
      </nav>

      {/* User Profile Footer */}
      <div className="p-2.5 sm:p-4 border-t border-primary-900 bg-neutral-950/50">
        <div className="flex items-center justify-center sm:justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div
              title={user?.fullName || user?.username}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0 ${isAdmin ? "bg-primary-600 ring-2 ring-primary-400" : "bg-success-600 ring-2 ring-success-400"}`}
            >
              {user?.username?.slice(0, 2).toUpperCase() || "US"}
            </div>
            <div className="hidden sm:block truncate">
              <p className="text-xs font-semibold text-white truncate">
                {user?.fullName || user?.username}
              </p>
              <p className="text-[11px] text-neutral-400 truncate">
                @{user?.username}
              </p>
            </div>
          </div>
          <span
            className={`hidden sm:inline px-2 py-0.5 rounded text-[10px] font-bold shrink-0 uppercase tracking-wide ${
              isAdmin
                ? "bg-primary-500/20 text-primary-300 border border-primary-500/30"
                : "bg-success-500/20 text-success-300 border border-success-500/30"
            }`}
          >
            {isAdmin ? "Admin" : "User"}
          </span>
        </div>

        <button
          onClick={() => logout()}
          title="Cerrar Sesión"
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-error-400 hover:text-white bg-error-500/10 hover:bg-error-600 rounded-lg transition-colors border border-error-500/20 hover:border-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-error-400 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-950"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
