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
    <aside className="w-20 lg:w-72 bg-gradient-to-b from-ink-900 to-ink-950 text-ink-200 flex flex-col shrink-0 min-h-screen border-r border-white/10 transition-[width]">
      {/* Brand Header */}
      <div className="p-4 lg:p-6 border-b border-white/10 flex items-center justify-center lg:justify-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-500 to-sky-400 flex items-center justify-center text-ink-950 shadow-brand shrink-0">
          <Package className="w-5 h-5" />
        </div>
        <div className="hidden lg:block">
          <h2 className="font-bold text-white text-base tracking-tight leading-none">
            UMG Dashboard
          </h2>
          <span className="text-xs text-ink-400">Control de inventario</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 lg:px-4 py-6 space-y-1.5">
        <p className="hidden lg:block px-3 pb-2 text-[11px] font-semibold text-ink-400 uppercase tracking-wider">
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
              className={`flex items-center justify-center lg:justify-start gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-brand-500 text-ink-950 shadow-brand"
                  : "text-ink-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="hidden lg:inline">{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-4 border-t border-white/10 my-4">
          <Link
            href="/"
            title="Ver catálogo público"
            className="flex items-center justify-center lg:justify-start gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-ink-400 hover:bg-white/5 hover:text-white transition-all"
          >
            <Home className="w-5 h-5 shrink-0" />
            <span className="hidden lg:inline">Ver Catálogo Público</span>
          </Link>
        </div>
      </nav>

      {/* User Profile Footer */}
      <div className="p-3 lg:p-4 border-t border-white/10 bg-black/10">
        <div className="hidden lg:flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0 ${isAdmin ? "bg-sky-600 ring-2 ring-sky-400" : "bg-brand-600 ring-2 ring-brand-400"}`}>
              {user?.username?.slice(0, 2).toUpperCase() || "US"}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">
                {user?.fullName || user?.username}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                @{user?.username}
              </p>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 uppercase tracking-wide ${
              isAdmin
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                : "bg-brand-500/20 text-brand-300 border border-brand-500/30"
            }`}
          >
            {isAdmin ? "Admin" : "User"}
          </span>
        </div>

        <button
          onClick={logout}
          title="Cerrar sesión"
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-xl transition-colors border border-rose-500/20 hover:border-transparent"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
