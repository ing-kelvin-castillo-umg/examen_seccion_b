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
    <aside className="relative w-full md:w-72 bg-ink-950 text-violet-100 flex flex-col shrink-0 min-h-0 md:min-h-screen border-b md:border-b-0 md:border-r border-brand-400/15 overflow-hidden">
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-brand-600/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-12 -right-28 w-56 h-56 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />
      {/* Brand Header */}
      <div className="relative p-4 md:p-6 border-b border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-accent-500 flex items-center justify-center text-white shadow-brand ring-1 ring-white/20">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-white text-base tracking-tight leading-none">
            UMG Dashboard
          </h2>
          <span className="text-[11px] text-violet-300/70 uppercase tracking-[0.15em]">Control central</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="relative flex-1 px-3 py-3 md:px-4 md:py-6 space-y-1.5">
        <p className="hidden md:block px-3 pb-2 text-[11px] font-semibold text-violet-300/60 uppercase tracking-[0.16em]">
          Módulos del Sistema
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
                  ? "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-brand border border-brand-300/20"
                  : "text-violet-200/75 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-3 border-t border-white/10 mt-3 md:pt-4 md:my-4">
          <Link
            href="/"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-violet-200/60 hover:bg-accent-400/10 hover:text-accent-200 border border-transparent hover:border-accent-300/20 transition-all"
          >
            <Home className="w-5 h-5 shrink-0" />
            <span>Ver Catálogo Público</span>
          </Link>
        </div>
      </nav>

      {/* User Profile Footer */}
      <div className="relative p-3 md:p-4 border-t border-white/10 bg-black/10">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-semibold text-xs shrink-0 ${isAdmin ? "bg-brand-600 ring-2 ring-brand-300/40" : "bg-accent-600 ring-2 ring-accent-300/40"}`}>
              {user?.username?.slice(0, 2).toUpperCase() || "US"}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">
                {user?.fullName || user?.username}
              </p>
              <p className="text-[11px] text-violet-300/60 truncate">
                @{user?.username}
              </p>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 uppercase tracking-wide ${
              isAdmin
                ? "bg-brand-500/20 text-brand-200 border border-brand-400/30"
                : "bg-accent-500/20 text-accent-200 border border-accent-400/30"
            }`}
          >
            {isAdmin ? "Admin" : "User"}
          </span>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-xl transition-colors border border-rose-400/20 hover:border-transparent"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
