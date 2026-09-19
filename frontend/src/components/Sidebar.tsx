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
  Sparkles,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();

  const navItems = [
    {
      name: "Catálogo de Productos",
      href: "/dashboard/products",
      icon: Boxes,
    },
  ];

  return (
    <aside className="w-64 bg-dark-900 text-slate-200 flex flex-col shrink-0 min-h-screen border-r border-slate-800/80 shadow-xl">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-accent-600 flex items-center justify-center text-white shadow-neon-emerald">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-black text-white text-base tracking-tight leading-none">
            UMG Panel
          </h2>
          <span className="text-[11px] text-brand-400 font-medium">Examen Parcial B</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <p className="px-3 pb-1 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
          Módulos Principales
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-gradient-to-r from-brand-600 to-emerald-600 text-white shadow-neon-emerald"
                  : "text-slate-400 hover:bg-dark-800 hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-500"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-4 border-t border-slate-800/80 my-4 space-y-1">
          <p className="px-3 pb-1 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
            Accesos Rápidos
          </p>
          <Link
            href="/"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:bg-dark-800 hover:text-brand-300 transition-all"
          >
            <Home className="w-4 h-4 shrink-0 text-slate-500" />
            <span>Ver Catálogo Público</span>
          </Link>
        </div>
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-dark-950/80">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0 ${isAdmin ? "bg-gradient-to-tr from-accent-700 to-accent-500 ring-2 ring-accent-400/40 shadow-neon-violet" : "bg-gradient-to-tr from-brand-700 to-brand-500 ring-2 ring-brand-400/40 shadow-neon-emerald"}`}>
              {user?.username?.slice(0, 2).toUpperCase() || "US"}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">
                {user?.fullName || user?.username}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                @{user?.username}
              </p>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-black shrink-0 uppercase tracking-wider ${
              isAdmin
                ? "bg-accent-950 text-accent-300 border border-accent-500/30"
                : "bg-brand-950 text-brand-300 border border-brand-500/30"
            }`}
          >
            {isAdmin ? "Admin" : "User"}
          </span>
        </div>

        <button
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600/90 rounded-xl transition-all border border-rose-500/20 hover:border-transparent"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

