"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { User } from "@/entities/user.entity";
import { AuthService } from "@/services/auth.service";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (
    username: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_TIME = 2 * 60 * 1000;

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {

  const [user, setUser] =
    useState<User | null>(null);

  const [token, setToken] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const router = useRouter();

  const inactivityTimer =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const session =
      AuthService.getStoredSession();

    if (session) {
      setUser(session.user);
      setToken(session.token);
    }

    setLoading(false);
  }, []);

  const login = async (
    username: string,
    password: string
  ) => {
    const session =
      await AuthService.login({
        username,
        password,
      });

    setUser(session.user);
    setToken(session.token);

    sessionStorage.removeItem(
      "logoutReason"
    );
  };

  const logout = async () => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }

    await AuthService.logout();

    setUser(null);
    setToken(null);

    router.push("/login");
  };

  useEffect(() => {
    if (!token || !user) {
      return;
    }

    const logoutByInactivity =
      async () => {

        console.warn(
          "[SECURITY] Sesión cerrada por inactividad"
        );

        sessionStorage.setItem(
          "logoutReason",
          "Sesión cerrada por inactividad"
        );

        await AuthService.logout();

        setUser(null);
        setToken(null);

        window.location.href =
          "/login?reason=inactivity";
      };

    const resetTimer = () => {
      if (inactivityTimer.current) {
        clearTimeout(
          inactivityTimer.current
        );
      }

      inactivityTimer.current =
        setTimeout(
          logoutByInactivity,
          INACTIVITY_TIME
        );
    };

    const events = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart",
    ];

    events.forEach((event) =>
      window.addEventListener(
        event,
        resetTimer
      )
    );

    resetTimer();

    return () => {
      if (inactivityTimer.current) {
        clearTimeout(
          inactivityTimer.current
        );
      }

      events.forEach((event) =>
        window.removeEventListener(
          event,
          resetTimer
        )
      );
    };
  }, [token, user]);

  const isAdmin =
    !!user?.roles?.includes("ROLE_ADMIN");

  const isAuthenticated =
    !!token && !!user;

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

export const useAuth =
  (): AuthContextType => {

    const context =
      useContext(AuthContext);

    if (!context) {
      throw new Error(
        "useAuth debe usarse dentro de un AuthProvider"
      );
    }

    return context;
  };
