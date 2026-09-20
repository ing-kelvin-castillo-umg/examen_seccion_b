"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/entities/user.entity";
import { AuthService } from "@/services/auth.service";
import { useRouter } from "next/navigation";

export type LogoutReason = "inactivity";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  /** Motivo del último cierre de sesión forzado (se muestra en /login). */
  logoutReason: LogoutReason | null;
  login: (username: string, password: string) => Promise<void>;
  logout: (reason?: LogoutReason) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function clearClientStorage(): void {
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch {
    /* almacenamiento no disponible */
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutReason, setLogoutReason] = useState<LogoutReason | null>(null);
  const router = useRouter();

  useEffect(() => {
    // La sesión se valida contra el backend vía BFF (cookie httpOnly), no con localStorage.
    AuthService.getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const session = await AuthService.login({ username, password });
    setLogoutReason(null);
    setUser(session.user);
  };

  // Flujo único de cierre de sesión (botón manual e inactividad): backend -> cookies -> estado -> /login.
  const logout = async (reason?: LogoutReason) => {
    try {
      await AuthService.logout();
    } catch {
      // Aunque el BFF no responda, la sesión local se cierra igualmente.
    }
    clearClientStorage();
    setLogoutReason(reason === "inactivity" ? "inactivity" : null);
    setUser(null);
    router.push("/login");
  };

  const isAdmin = !!(user?.roles && user.roles.includes("ROLE_ADMIN"));
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        loading,
        logoutReason,
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
