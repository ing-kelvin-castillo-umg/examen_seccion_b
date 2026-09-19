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
  X,
} from "lucide-react";

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open = false, onClose }) => {
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
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 md:static md:z-auto md:min-h-screen md:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      } bg-ink-900 text-ink-100 flex flex-col shrink-0 border-r border-ink-800`}
    >
      {/* Brand Header */}
      <div className="p-6 border-b border-ink-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
          <Package className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-white text-base tracking-tight leading-none">
            UMG Dashboard
          </h2>
          <span className="text-xs text-ink-300">Examen Parcial</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar menú"
          className="md:hidden p-2 rounded-lg text-ink-300 hover:text-white hover:bg-ink-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        <p className="px-3 pb-2 text-[11px] font-semibold text-ink-300 uppercase tracking-wider">
          Módulos del Sistema
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 ${
                isActive
                  ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
                  : "text-ink-200 hover:bg-ink-800 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-4 border-t border-ink-800/80 my-4">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-ink-300 hover:bg-ink-800 hover:text-white transition-all"
          >
            <Home className="w-5 h-5 shrink-0" />
            <span>Ver Catálogo Público</span>
          </Link>
        </div>
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-ink-800 bg-ink-950/50">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0 ${isAdmin ? "bg-accent-700 ring-2 ring-accent-400" : "bg-emerald-600 ring-2 ring-emerald-400"}`}>
              {user?.username?.slice(0, 2).toUpperCase() || "US"}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">
                {user?.fullName || user?.username}
              </p>
              <p className="text-[11px] text-ink-300 truncate">
                @{user?.username}
              </p>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 uppercase tracking-wide ${
              isAdmin
                ? "bg-accent-500/20 text-accent-300 border border-accent-500/30"
                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
            }`}
          >
            {isAdmin ? "Admin" : "User"}
          </span>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-lg transition-colors border border-rose-500/20 hover:border-transparent"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
