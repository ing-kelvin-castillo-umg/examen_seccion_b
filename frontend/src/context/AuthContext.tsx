"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
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
  /**
   * `reason: "inactivity"` distingue el cierre de sesión automático por
   * inactividad (Fase 3) del logout manual: solo el primero redirige con el
   * mensaje "Sesión cerrada por inactividad" visible en /login.
   */
  logout: (reason?: "inactivity") => Promise<void>;
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
      setToken(session.token);
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const session = await AuthService.login({ username, password });
    setUser(session.user);
    setToken(session.token);
  };

  const logout = async (reason?: "inactivity") => {
    // Fase 3: el logout manual (botón "Cerrar Sesión") ahora también notifica
    // al backend para que revoque los refresh tokens del usuario, en vez de
    // limpiar solo el almacenamiento local como antes.
    await AuthService.logout();

    // El motivo se guarda en sessionStorage, NO en el query string de la URL
    // de destino. Motivo: en cuanto isAuthenticated pasa a false (justo
    // abajo), el guard de dashboard/layout.tsx también reacciona con su
    // propio router.push("/login") (sin reason, ver ese archivo). Los dos
    // router.push compiten por la URL final y el query param puede perderse
    // antes de que /login llegue a leerlo. sessionStorage no depende de la
    // URL, así que sobrevive a esa carrera sin importar cuál push "gane".
    if (reason === "inactivity" && typeof window !== "undefined") {
      sessionStorage.setItem("logoutReason", "inactivity");
    }

    setUser(null);
    setToken(null);
    router.push(reason === "inactivity" ? "/login" : "/");
  };

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
