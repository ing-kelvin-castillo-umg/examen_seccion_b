"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Package, LogIn, LayoutDashboard, LogOut, ShieldCheck, User as UserIcon } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-ivory-300 bg-ivory-50/90 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-steel-50 text-steel-600 flex items-center justify-center border border-ivory-200 shadow-sm group-hover:bg-steel-100 transition-colors">
            <Package className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-[#172331] leading-tight">UMG Store</span>
            <span className="text-[10px] font-medium text-[#657180] tracking-wider uppercase">Catálogo</span>
          </div>
        </Link>

        {/* Navigation / Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/products"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-steel-700 bg-steel-50 hover:bg-steel-100 rounded-lg transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Panel de Productos</span>
              </Link>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-ivory-100 rounded-lg text-xs font-medium text-[#172331]">
                {isAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-[#345A82]" />
                ) : (
                  <UserIcon className="w-4 h-4 text-[#5E6670]" />
                )}
                <span>{user?.username}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isAdmin ? "bg-[#DCE7F3] text-[#345A82]" : "bg-[#ECE8E0] text-[#5E6670]"}`}>
                  {isAdmin ? "ADMIN" : "USER"}
                </span>
              </div>

              <button
                onClick={() => logout("manual")}
                title="Cerrar sesión"
                className="p-2 text-[#657180] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-steel-500 hover:bg-steel-600 rounded-lg shadow-sm shadow-steel-500/20 transition-all hover:shadow-md hover:shadow-steel-500/30"
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
