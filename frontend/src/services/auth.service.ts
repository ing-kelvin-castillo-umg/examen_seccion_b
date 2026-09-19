import { AuthResponseDto, UserResponseDto } from "@/dtos/auth.dto";
import { AuthSession, User } from "@/entities/user.entity";
import { AuthMapper } from "@/mappers/auth.mapper";
import { ApiClient } from "./api.client";
import { TokenManager } from "./token.manager";

export type LogoutReason = "user" | "inactivity";

export class AuthService {
  static async login(credentials: { username: string; password: string }): Promise<AuthSession> {
    const dto = AuthMapper.toLoginDto(credentials);
    const response = await ApiClient.post<AuthResponseDto>("/api/auth/login", dto);
    const session = AuthMapper.toSession(response.data);

    TokenManager.saveTokens(response.data);
    TokenManager.saveUser(session.user);

    return session;
  }

  static async getCurrentUser(): Promise<User> {
    const response = await ApiClient.get<UserResponseDto>("/api/auth/me");
    return AuthMapper.toUserFromResponse(response.data);
  }

  /** Renueva el access token usando el refresh token almacenado (ver TokenManager). */
  static refreshSession(): Promise<string | null> {
    return TokenManager.refreshAccessToken();
  }

  /**
   * Cierre de sesión centralizado:
   *  1. Notifica al backend (POST /api/auth/logout) para invalidar el access token
   *     y revocar el refresh token de esta sesión. Se envía aunque el access token
   *     haya expirado; nunca bloquea el cierre local si el backend no responde.
   *  2. Limpia el almacenamiento local (tokens y usuario).
   */
  static async logout(reason: LogoutReason = "user"): Promise<void> {
    const token = TokenManager.getAccessToken();
    const refreshToken = TokenManager.getRefreshToken();

    try {
      if (token || refreshToken) {
        await ApiClient.post<void>(
          "/api/auth/logout",
          { refreshToken, reason: reason === "inactivity" ? "INACTIVITY" : "USER_LOGOUT" },
          { skipAuthRefresh: true, keepalive: true }
        );
        console.info(`[AUTH] Backend notificado del cierre de sesión (motivo: ${reason}). Token invalidado.`);
      }
    } catch (error: any) {
      console.warn("[AUTH] No se pudo notificar el logout al backend:", error?.message);
    } finally {
      TokenManager.clear();
    }
  }

  static getStoredSession(): AuthSession | null {
    const token = TokenManager.getAccessToken();
    const user = TokenManager.getStoredUser<User>();

    if (!token || !user) return null;

    return {
      token,
      refreshToken: TokenManager.getRefreshToken(),
      expiresAt: TokenManager.getAccessTokenExpiresAt(),
      user,
      isAuthenticated: true,
      isAdmin: user.roles?.includes("ROLE_ADMIN") || false,
    };
  }
}
