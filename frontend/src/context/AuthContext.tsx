"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { User } from "@/entities/user.entity";
import { AuthService } from "@/services/auth.service";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutForInactivity: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const session = AuthService.getStoredSession();
    if (session) {
      setUser(session.user);
      setToken(session.accessToken);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener("auth:logout", handleSessionExpired);
    return () => window.removeEventListener("auth:logout", handleSessionExpired);
  }, []);

  const login = async (username: string, password: string) => {
    const session = await AuthService.login({ username, password });
    setUser(session.user);
    setToken(session.accessToken);
  };

  const performLogout = useCallback(async (inactivity: boolean) => {
    await AuthService.logout();
    setUser(null);
    setToken(null);
    if (inactivity) {
      sessionStorage.setItem("authMessage", "Sesión cerrada por inactividad");
      router.replace("/login");
    } else {
      router.push("/");
    }
  }, [router]);

  const logout = useCallback(async () => performLogout(false), [performLogout]);
  const logoutForInactivity = useCallback(async () => performLogout(true), [performLogout]);

  const isAdmin = !!(user?.roles && user.roles.includes("ROLE_ADMIN"));
  const isAuthenticated = !!token && !!user;

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
        logoutForInactivity,
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
