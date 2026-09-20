"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/entities/user.entity";
import { AuthService } from "@/services/auth.service";
import { useRouter } from "next/navigation";

import { useIdleTimer } from "@/hooks/useIdleTimer";

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  remainingIdleSeconds: number;
  login: (username: string, password: string) => Promise<void>;
  logout: (reason?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleLogout = async (reason: string = "manual") => {
    await AuthService.logoutSync(reason);
    setUser(null);
    setToken(null);
    setRefreshToken(null);

    if (reason === "inactivity") {
      router.push("/login?reason=inactivity");
    } else {
      router.push("/");
    }
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = !!(user?.roles && user.roles.includes("ROLE_ADMIN"));

  // Detector de inactividad: 120 segundos (2 minutos) para evaluación
  const { remainingSeconds } = useIdleTimer({
    timeoutSeconds: 120,
    enabled: isAuthenticated && !loading,
    onIdle: () => {
      console.warn("[SECURITY] Tiempo de inactividad agotado. Cerrando sesión...");
      handleLogout("inactivity");
    },
  });

  useEffect(() => {
    const session = AuthService.getStoredSession();
    if (session) {
      setUser(session.user);
      setToken(session.token);
      setRefreshToken(session.refreshToken || null);
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const session = await AuthService.login({ username, password });
    setUser(session.user);
    setToken(session.token);
    setRefreshToken(session.refreshToken || null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        isAuthenticated,
        isAdmin,
        loading,
        remainingIdleSeconds: remainingSeconds,
        login,
        logout: handleLogout,
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
