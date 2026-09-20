import { AuthResponseDto, UserResponseDto } from "@/dtos/auth.dto";
import { AuthSession, User } from "@/entities/user.entity";
import { AuthMapper } from "@/mappers/auth.mapper";
import { ApiClient } from "./api.client";

export class AuthService {
  static readonly INACTIVITY_LOGOUT_MESSAGE = "Sesión cerrada por inactividad";
  private static readonly LOGOUT_MESSAGE_KEY = "auth:logout-message";

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

  static clearSession(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  }

  static async logout(): Promise<void> {
    try {
      await ApiClient.revokeSession();
    } catch (error) {
      console.warn("No fue posible confirmar el logout en el backend:", error);
    } finally {
      this.clearSession();
    }
  }

  static storeInactivityLogoutMessage(): void {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(this.LOGOUT_MESSAGE_KEY, this.INACTIVITY_LOGOUT_MESSAGE);
    }
  }

  static consumeLogoutMessage(): string | null {
    if (typeof window === "undefined") return null;

    const message = sessionStorage.getItem(this.LOGOUT_MESSAGE_KEY);
    sessionStorage.removeItem(this.LOGOUT_MESSAGE_KEY);
    return message;
  }

  static getStoredSession(): AuthSession | null {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    const userStr = localStorage.getItem("user");

    if (!token || !refreshToken || !userStr) {
      this.clearSession();
      return null;
    }

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
      this.clearSession();
      return null;
    }
  }
}
