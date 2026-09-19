"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { User } from "@/entities/user.entity";
import { AuthService, LogoutReason } from "@/services/auth.service";
import { ActivityMonitor } from "@/services/activity.monitor";
import { setSessionNotice } from "@/lib/session-notice";
import { AUTH_EVENTS, SessionExpiredReason, TokenManager } from "@/services/token.manager";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  token: string | null;
  /** Expiración del access token actual (epoch ms) */
  tokenExpiresAt: number | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  /** Cierre de sesión centralizado (manual o por inactividad) */
  logout: (reason?: LogoutReason) => Promise<void>;
  /** Fuerza la renovación del access token (devuelve el nuevo token o null) */
  refreshSession: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Cada cuánto se verifica en segundo plano si el access token debe renovarse. */
const REFRESH_CHECK_INTERVAL_MS = 10_000;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tokenExpiresAt, setTokenExpiresAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const clearSessionState = useCallback(() => {
    setUser(null);
    setToken(null);
    setTokenExpiresAt(null);
  }, []);

  // Restaurar sesión almacenada
  useEffect(() => {
    const session = AuthService.getStoredSession();
    if (session) {
      setUser(session.user);
      setToken(session.token);
      setTokenExpiresAt(session.expiresAt);
    }
    setLoading(false);
  }, []);

  // Escuchar eventos globales de sesión emitidos por TokenManager
  useEffect(() => {
    const onRefreshed = (e: Event) => {
      const newToken = (e as CustomEvent<{ token: string }>).detail?.token ?? TokenManager.getAccessToken();
      setToken(newToken);
      setTokenExpiresAt(TokenManager.getAccessTokenExpiresAt());
    };
    const onExpired = (e: Event) => {
      const reason = (e as CustomEvent<{ reason: SessionExpiredReason }>).detail?.reason ?? "session_expired";
      setSessionNotice(reason);
      clearSessionState();
      router.push(`/login?reason=${reason}`);
    };

    window.addEventListener(AUTH_EVENTS.TOKEN_REFRESHED, onRefreshed);
    window.addEventListener(AUTH_EVENTS.SESSION_EXPIRED, onExpired);
    return () => {
      window.removeEventListener(AUTH_EVENTS.TOKEN_REFRESHED, onRefreshed);
      window.removeEventListener(AUTH_EVENTS.SESSION_EXPIRED, onExpired);
    };
  }, [clearSessionState, router]);

  // Renovación proactiva en segundo plano: aunque el usuario no haga peticiones,
  // el access token se renueva antes de expirar para no interrumpir la sesión.
  useEffect(() => {
    if (!token) return;
    const check = () => {
      if (TokenManager.isAccessTokenExpiringSoon() && TokenManager.getRefreshToken()) {
        TokenManager.refreshAccessToken();
      }
    };
    check();
    const id = window.setInterval(check, REFRESH_CHECK_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [token]);

  const login = async (username: string, password: string) => {
    const session = await AuthService.login({ username, password });
    setUser(session.user);
    setToken(session.token);
    setTokenExpiresAt(session.expiresAt);
  };

  /**
   * Logout centralizado: usado por el botón "Cerrar Sesión" y por el detector de
   * inactividad. Notifica al backend, limpia el estado local y redirige.
   */
  const logout = useCallback(
    async (reason: LogoutReason = "user") => {
      await AuthService.logout(reason);
      ActivityMonitor.reset();
      if (reason === "inactivity") setSessionNotice("inactivity");
      clearSessionState();
      router.push(reason === "inactivity" ? "/login?reason=inactivity" : "/");
    },
    [clearSessionState, router]
  );

  const refreshSession = () => AuthService.refreshSession();

  const isAdmin = !!(user?.roles && user.roles.includes("ROLE_ADMIN"));
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        tokenExpiresAt,
        isAuthenticated,
        isAdmin,
        loading,
        login,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
