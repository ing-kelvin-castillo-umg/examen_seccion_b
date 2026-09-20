"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { User } from "@/entities/user.entity";
import { AuthService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { useInactivityLogout } from "@/hooks/useInactivityLogout";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const logoutPromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    const session = AuthService.getStoredSession();
    if (session) {
      setUser(session.user);
      setToken(session.token);
    }
    setLoading(false);

    const handleTokenRefreshed = (event: Event) => {
      setToken((event as CustomEvent<string>).detail);
    };
    const handleSessionExpired = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener("auth:token-refreshed", handleTokenRefreshed);
    window.addEventListener("auth:session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener("auth:token-refreshed", handleTokenRefreshed);
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, []);

  const login = async (username: string, password: string) => {
    const session = await AuthService.login({ username, password });
    setUser(session.user);
    setToken(session.token);
  };

  const performLogout = useCallback((reason?: "inactivity") => {
    if (!logoutPromiseRef.current) {
      logoutPromiseRef.current = (async () => {
        try {
          await AuthService.logout();
        } catch (error) {
          console.error("No fue posible notificar el logout al backend:", error);
        } finally {
          setUser(null);
          setToken(null);
          router.replace(reason === "inactivity" ? "/login?reason=inactivity" : "/");
        }
      })().finally(() => {
        logoutPromiseRef.current = null;
      });
    }

    return logoutPromiseRef.current;
  }, [router]);

  const logout = useCallback(() => performLogout(), [performLogout]);
  const logoutByInactivity = useCallback(() => performLogout("inactivity"), [performLogout]);

  const isAdmin = !!(user?.roles && user.roles.includes("ROLE_ADMIN"));
  const isAuthenticated = !!token && !!user;

  useInactivityLogout(isAuthenticated, logoutByInactivity);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        loading,
        login,
        logout,
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
