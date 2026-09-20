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
      if (session.refreshToken) {
        localStorage.setItem("refreshToken", session.refreshToken);
      }
      localStorage.setItem("user", JSON.stringify(session.user));
    }

    return session;
  }

  static async getCurrentUser(): Promise<User> {
    const response = await ApiClient.get<UserResponseDto>("/api/auth/me");
    return AuthMapper.toUserFromResponse(response.data);
  }

  static async refreshToken(): Promise<string> {
    if (typeof window === "undefined") {
      throw new Error("No es posible refrescar token fuera del navegador");
    }

    const currentRefreshToken = localStorage.getItem("refreshToken");
    if (!currentRefreshToken) {
      this.logout();
      throw new Error("No hay refresh token almacenado");
    }

    try {
      const response = await ApiClient.rawRequest<AuthResponseDto>("/api/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
      });

      const newToken = response.data?.token;
      if (!newToken) {
        throw new Error("El servidor no retornó un nuevo token de acceso");
      }

      localStorage.setItem("token", newToken);
      if (response.data.refreshToken) {
        localStorage.setItem("refreshToken", response.data.refreshToken);
      }

      return newToken;
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  static async logoutSync(reason: string = "manual"): Promise<void> {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      try {
        await ApiClient.rawRequest("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason }),
        });
      } catch (err: any) {
        console.warn("[AUTH] Error al notificar logout al backend:", err.message);
      }
    }
    this.logout();
  }

  static logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  }


  static getStoredSession(): AuthSession | null {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken") || undefined;
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) return null;

    try {
      const user = JSON.parse(userStr) as User;
      return {
        token,
        refreshToken,
        user,
        isAuthenticated: true,
        isAdmin: user.roles?.includes("ROLE_ADMIN") || false,
      };
    } catch {
      return null;
    }
  }
}

