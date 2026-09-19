import { AuthResponseDto, UserResponseDto } from "@/dtos/auth.dto";
import { AuthSession, User } from "@/entities/user.entity";
import { AuthMapper } from "@/mappers/auth.mapper";
import { ApiClient } from "./api.client";
import { TokenManager } from "./token.manager";

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

  static logout(): void {
    TokenManager.clear();
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
