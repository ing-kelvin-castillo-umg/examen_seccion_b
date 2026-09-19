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
      localStorage.setItem("user", JSON.stringify(session.user));
    }

    return session;
  }

  static async getCurrentUser(): Promise<User> {
    const response = await ApiClient.get<UserResponseDto>("/api/auth/me");
    return AuthMapper.toUserFromResponse(response.data);
  }

  /**
   * Cierra sesión: notifica al backend (para que revoque los refresh tokens
   * del usuario, Fase 3) y limpia el almacenamiento local. Es tolerante a
   * fallos de red: aunque el backend no responda, igual se limpia la sesión
   * en el cliente, para no "atrapar" al usuario sin poder salir. Se usa
   * fetch directo (no ApiClient) porque no necesita el interceptor de
   * refresh de la Fase 2 (el endpoint es público) y sí necesita un timeout
   * acotado para no bloquear el logout por inactividad si la red está lenta.
   */
  static async logout(): Promise<void> {
    if (typeof window === "undefined") return;

    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
          signal: controller.signal,
        });
      } catch (error) {
        console.warn(
          "[AuthService] No se pudo notificar el logout al backend; se cierra la sesión localmente de todas formas:",
          error
        );
      } finally {
        clearTimeout(timeoutId);
      }
    }

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  }

  static getStoredSession(): AuthSession | null {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) return null;

    try {
      const user = JSON.parse(userStr) as User;
      return {
        token,
        refreshToken: refreshToken || "",
        user,
        isAuthenticated: true,
        isAdmin: user.roles?.includes("ROLE_ADMIN") || false,
      };
    } catch {
      return null;
    }
  }
}
