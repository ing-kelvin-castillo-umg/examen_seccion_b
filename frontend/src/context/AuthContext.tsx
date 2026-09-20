"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { User } from "@/entities/user.entity";
import { AuthService } from "@/services/auth.service";
import { ACCESS_TOKEN_REFRESHED_EVENT } from "@/services/api.client";

export const INACTIVITY_TIMEOUT_MS = 3 * 60 * 1000;
export const INACTIVITY_LOGOUT_MESSAGE = "Sesión cerrada por inactividad";
export const INACTIVITY_LOGOUT_MESSAGE_KEY = "auth:inactivity-message";

type LogoutReason = "manual" | "inactivity";

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  inactivitySecondsRemaining: number | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [inactivitySecondsRemaining, setInactivitySecondsRemaining] = useState<number | null>(null);
  const logoutStartedRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    const session = AuthService.getStoredSession();
    if (session) {
      setUser(session.user);
      setAccessToken(session.accessToken);
    }

    const handleAccessTokenRefreshed = (event: Event) => {
      if (!logoutStartedRef.current) {
        setAccessToken((event as CustomEvent<string>).detail);
      }
    };

    window.addEventListener(ACCESS_TOKEN_REFRESHED_EVENT, handleAccessTokenRefreshed);
    setLoading(false);

    return () => {
      window.removeEventListener(ACCESS_TOKEN_REFRESHED_EVENT, handleAccessTokenRefreshed);
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const session = await AuthService.login({ username, password });
    logoutStartedRef.current = false;
    sessionStorage.removeItem(INACTIVITY_LOGOUT_MESSAGE_KEY);
    setUser(session.user);
    setAccessToken(session.accessToken);
  }, []);

  const executeLogout = useCallback(async (reason: LogoutReason) => {
    if (logoutStartedRef.current) return;
    logoutStartedRef.current = true;

    if (reason === "inactivity") {
      sessionStorage.setItem(INACTIVITY_LOGOUT_MESSAGE_KEY, INACTIVITY_LOGOUT_MESSAGE);
    } else {
      sessionStorage.removeItem(INACTIVITY_LOGOUT_MESSAGE_KEY);
    }

    const backendLogoutRequest = AuthService.logout();
    setUser(null);
    setAccessToken(null);
    setInactivitySecondsRemaining(null);
    router.replace("/login");
    await backendLogoutRequest;
  }, [router]);

  const logout = useCallback(
    () => executeLogout("manual"),
    [executeLogout],
  );

  const isAdmin = !!(user?.roles && user.roles.includes("ROLE_ADMIN"));
  const isAuthenticated = !!accessToken && !!user;

  useEffect(() => {
    if (!isAuthenticated) {
      setInactivitySecondsRemaining(null);
      return;
    }

    let deadline = Date.now() + INACTIVITY_TIMEOUT_MS;
    let lastActivityResetAt = 0;
    setInactivitySecondsRemaining(Math.ceil(INACTIVITY_TIMEOUT_MS / 1000));

    const resetInactivityDeadline = () => {
      const now = Date.now();
      if (logoutStartedRef.current || now - lastActivityResetAt < 1_000) return;

      lastActivityResetAt = now;
      deadline = now + INACTIVITY_TIMEOUT_MS;
      setInactivitySecondsRemaining(Math.ceil(INACTIVITY_TIMEOUT_MS / 1000));
    };

    const timerId = window.setInterval(() => {
      const secondsRemaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setInactivitySecondsRemaining(secondsRemaining);

      if (secondsRemaining === 0 && !logoutStartedRef.current) {
        window.clearInterval(timerId);
        void executeLogout("inactivity");
      }
    }, 1_000);

    const activityEvents: Array<keyof WindowEventMap> = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart",
      "pointerdown",
    ];

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetInactivityDeadline, { passive: true });
    });

    return () => {
      window.clearInterval(timerId);
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetInactivityDeadline);
      });
    };
  }, [executeLogout, isAuthenticated]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated,
        isAdmin,
        loading,
        inactivitySecondsRemaining,
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
