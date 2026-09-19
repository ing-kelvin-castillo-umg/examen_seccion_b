import { AuthResponseDto, UserResponseDto } from "@/dtos/auth.dto";
import { AuthSession, User } from "@/entities/user.entity";
import { AuthMapper } from "@/mappers/auth.mapper";
import { ApiClient } from "./api.client";

export class AuthService {
  static async login(credentials: { username: string; password: string }): Promise<AuthSession> {
    const dto = AuthMapper.toLoginDto(credentials);
    const response = await ApiClient.post<AuthResponseDto>("/api/auth/login", dto);
    const session = AuthMapper.toSession(response.data);

    if (typeof window !== "undefined") {
      localStorage.setItem("token", session.token);
      localStorage.setItem("refreshToken", session.refreshToken);
      localStorage.setItem("expiresAt", String(session.expiresAt));
      localStorage.setItem("user", JSON.stringify(session.user));
    }

    return session;
  }

  static async refresh(): Promise<AuthSession> {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;
    if (!refreshToken) {
      throw new Error("No existe un refresh token activo");
    }

    const response = await ApiClient.post<AuthResponseDto>("/api/auth/refresh", { refreshToken });
    const session = AuthMapper.toSession(response.data);
    if (typeof window !== "undefined") {
      localStorage.setItem("token", session.token);
      localStorage.setItem("refreshToken", session.refreshToken);
      localStorage.setItem("expiresAt", String(session.expiresAt));
      localStorage.setItem("user", JSON.stringify(session.user));
    }
    return session;
  }

  static async getCurrentUser(): Promise<User> {
    const response = await ApiClient.get<UserResponseDto>("/api/auth/me");
    return AuthMapper.toUserFromResponse(response.data);
  }

  static async logout(): Promise<void> {
    if (typeof window !== "undefined") {
      const refreshToken = localStorage.getItem("refreshToken");
      try {
        await ApiClient.post<void>("/api/auth/logout", { refreshToken });
      } catch (error) {
        console.warn("[AUTH] No se pudo notificar el logout al backend", error);
      }
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("expiresAt");
      localStorage.removeItem("user");
    }
  }

  static getStoredSession(): AuthSession | null {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    const expiresAt = Number(localStorage.getItem("expiresAt") || 0);
    const userStr = localStorage.getItem("user");

    if (!token || !refreshToken || !userStr) return null;

    try {
      const user = JSON.parse(userStr) as User;
      return {
        token,
        refreshToken,
        expiresAt,
        user,
        isAuthenticated: true,
        isAdmin: user.roles?.includes("ROLE_ADMIN") || false,
      };
    } catch {
      return null;
    }
  }
}
