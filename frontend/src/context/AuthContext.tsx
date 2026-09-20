"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { User } from "@/entities/user.entity";
import { AuthService } from "@/services/auth.service";
import { useInactivityLogout } from "@/hooks/useInactivityLogout";
import { useRouter } from "next/navigation";

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
  const logoutInProgressRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    const session = AuthService.getStoredSession();
    if (session) {
      setUser(session.user);
      setToken(session.token);
    }
    setLoading(false);

    const handleTokenRefreshed = (event: Event) => {
      const customEvent = event as CustomEvent<{ token: string }>;
      setToken(customEvent.detail.token);
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

  const isAdmin = !!(user?.roles && user.roles.includes("ROLE_ADMIN"));
  const isAuthenticated = !!token && !!user;

  const performLogout = useCallback(
    async (reason: "manual" | "inactivity") => {
      if (logoutInProgressRef.current) return;

      logoutInProgressRef.current = true;
      try {
        await AuthService.logout();
      } finally {
        if (reason === "inactivity") {
          AuthService.storeInactivityLogoutMessage();
        }

        setUser(null);
        setToken(null);
        logoutInProgressRef.current = false;

        if (reason === "inactivity") {
          router.replace("/login");
        } else {
          router.push("/");
        }
      }
    },
    [router],
  );

  const logout = useCallback(() => performLogout("manual"), [performLogout]);
  const logoutByInactivity = useCallback(
    () => performLogout("inactivity"),
    [performLogout],
  );

  useInactivityLogout({
    enabled: !loading && isAuthenticated,
    onInactive: logoutByInactivity,
  });

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
