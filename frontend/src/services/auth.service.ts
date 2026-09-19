import { AuthResponseDto, UserResponseDto } from "@/dtos/auth.dto";
import { AuthSession, User } from "@/entities/user.entity";
import { AuthMapper } from "@/mappers/auth.mapper";
import { ApiClient } from "./api.client";
import { readSession, saveSession, clearSession } from "./session.store";

export class AuthService {
  static async login(credentials: { username: string; password: string }): Promise<AuthSession> {
    const response = await ApiClient.post<AuthResponseDto>("/api/auth/login", AuthMapper.toLoginDto(credentials));
    saveSession(response.data);
    return AuthMapper.toSession(response.data);
  }
  static async getCurrentUser(): Promise<User> {
    const response = await ApiClient.get<UserResponseDto>("/api/auth/me");
    return AuthMapper.toUserFromResponse(response.data);
  }
  static logout(): void { clearSession(); }
  static getStoredSession(): AuthSession | null {
    const data = readSession();
    return data ? AuthMapper.toSession(data) : null;
  }
}
