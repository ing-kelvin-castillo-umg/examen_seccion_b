"use client";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { User } from "@/entities/user.entity";
import { AuthService } from "@/services/auth.service";
import { ApiClient } from "@/services/api.client";
import { SESSION_EVENT, SESSION_KEY } from "@/services/session.store";
import { retryLogout } from "@/services/logout.service";
import { useRouter } from "next/navigation";

const IDLE_MS = 120000;
interface AuthContextType {
  user: User | null; token: string | null; isAuthenticated: boolean; isAdmin: boolean;
  loading: boolean; idleSeconds: number;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user,setUser] = useState<User | null>(null);
  const [token,setToken] = useState<string | null>(null);
  const [loading,setLoading] = useState(true);
  const [idleSeconds,setIdleSeconds] = useState(120);
  const router = useRouter();

  const logoutWithReason = useCallback((reason: "manual" | "inactivity") => {
    AuthService.logout(reason);
    setUser(null); setToken(null);
    router.replace("/login?reason=" + reason);
  },[router]);

  useEffect(() => {
    const sync = () => {
      const session = AuthService.getStoredSession();
      setUser(session?.user || null); setToken(session?.token || null); setLoading(false);
    };
    const storage = (event: StorageEvent) => {
      if (event.key === SESSION_KEY) {
        sync();
        if (!AuthService.getStoredSession()) {
          router.replace("/login?reason=" + (localStorage.getItem("umg.logoutReason") || "expired"));
        }
      }
    };
    sync();
    window.addEventListener(SESSION_EVENT,sync); window.addEventListener("storage",storage);
    const retry = () => { void retryLogout().catch(() => {}); };
    retry(); window.addEventListener("online",retry);
    const pendingTimer = window.setInterval(retry,15000);
    return () => {
      window.removeEventListener(SESSION_EVENT,sync); window.removeEventListener("storage",storage);
      window.removeEventListener("online",retry); clearInterval(pendingTimer);
    };
  },[router]);

  const authenticated = !!user && !!token;
  useEffect(() => {
    if (!authenticated) return;
    let lastWritten = 0;
    const lastActivity = () => Number(localStorage.getItem("umg.lastActivity") || Date.now());
    if (!localStorage.getItem("umg.lastActivity")) localStorage.setItem("umg.lastActivity",String(Date.now()));
    const checkIdle = () => {
      const remaining = IDLE_MS - (Date.now() - lastActivity());
      setIdleSeconds(Math.max(0,Math.ceil(remaining/1000)));
      if (remaining <= 0 && AuthService.getStoredSession()) {
        console.info("[AUTH] Inactividad detectada: cierre de sesión automático.");
        logoutWithReason("inactivity");
        return true;
      }
      return remaining <= 0;
    };
    const activity = () => {
      // An event after sleep must not resurrect an already timed-out session.
      if (checkIdle()) return;
      if (Date.now()-lastWritten > 1000) {
        lastWritten=Date.now(); localStorage.setItem("umg.lastActivity",String(lastWritten));
        setIdleSeconds(120);
      }
    };
    const events = ["mousemove","keydown","click","scroll","touchstart"];
    events.forEach(event=>window.addEventListener(event,activity,{passive:true}));
    window.addEventListener("focus",checkIdle); document.addEventListener("visibilitychange",checkIdle);
    checkIdle();
    const idleTimer = window.setInterval(checkIdle,1000);
    const refreshTimer = window.setInterval(() => {
      if (!checkIdle() && AuthService.getStoredSession()) void ApiClient.refresh().catch(() => {});
    },5000);
    return () => {
      clearInterval(idleTimer); clearInterval(refreshTimer);
      events.forEach(event=>window.removeEventListener(event,activity));
      window.removeEventListener("focus",checkIdle); document.removeEventListener("visibilitychange",checkIdle);
    };
  },[authenticated,logoutWithReason]);

  const login = async (username: string,password: string) => {
    const session = await AuthService.login({username,password});
    setUser(session.user); setToken(session.token);
  };
  return <AuthContext.Provider value={{user,token,loading,idleSeconds,login,
    logout:()=>logoutWithReason("manual"), isAuthenticated:authenticated,
    isAdmin:!!user?.roles?.includes("ROLE_ADMIN")}}>{children}</AuthContext.Provider>;
};
export const useAuth = () => {
  const context=useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};
