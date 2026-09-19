"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { User } from "@/entities/user.entity";
import { AuthService } from "@/services/auth.service";
import { useRouter } from "next/navigation";

// Tiempo de inactividad tolerado antes de cerrar la sesión automáticamente.
// 2 minutos, pensado para poder evidenciar el flujo en pruebas.
const INACTIVITY_TIMEOUT_MS = 2 * 60 * 1000;
const ACTIVITY_EVENTS = ["mousemove", "keydown", "click", "scroll", "touchstart"];

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Punto único de cierre de sesión: notifica al backend, limpia el estado local
  // y redirige. Lo usan tanto el botón manual de "Cerrar Sesión" como el detector
  // de inactividad, para que ambos caminos queden sincronizados con el servidor.
  const performLogout = useCallback(
    async (reason?: "inactivity") => {
      await AuthService.logoutFromBackend();
      AuthService.logout();
      setUser(null);
      setToken(null);
      if (reason === "inactivity") {
        // Se guarda en sessionStorage (no como query param) para que el mensaje se muestre
        // sin importar cuál de las dos redirecciones llegue primero a /login: esta o la del
        // guard de DashboardLayout, que también reacciona en cuanto isAuthenticated pasa a false.
        sessionStorage.setItem("logoutReason", "inactivity");
      }
      router.push(reason === "inactivity" ? "/login" : "/");
    },
    [router]
  );

  const logout = () => {
    void performLogout();
  };

  const isAuthenticated = !!token && !!user;

  // Detector de inactividad: cualquier interacción del usuario reinicia el temporizador.
  // Si no hay actividad durante INACTIVITY_TIMEOUT_MS, se cierra la sesión automáticamente.
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const resetTimer = () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      inactivityTimer.current = setTimeout(() => {
        void performLogout("inactivity");
      }, INACTIVITY_TIMEOUT_MS);
    };

    ACTIVITY_EVENTS.forEach((eventName) => window.addEventListener(eventName, resetTimer));
    resetTimer();

    return () => {
      ACTIVITY_EVENTS.forEach((eventName) => window.removeEventListener(eventName, resetTimer));
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, [isAuthenticated, performLogout]);

  const isAdmin = !!(user?.roles && user.roles.includes("ROLE_ADMIN"));

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
