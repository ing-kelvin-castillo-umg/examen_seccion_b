export type UserRole = 'ROLE_ADMIN' | 'ROLE_USER';

export interface User {
  id?: number;
  username: string;
  fullName: string;
  email?: string;
  roles: UserRole[];
  enabled?: boolean;
}

export interface AuthSession {
  token: string;
  refreshToken: string | null;
  /** Expiración del access token (epoch ms) */
  expiresAt: number | null;
  user: User;
  isAuthenticated: boolean;
  isAdmin: boolean;
}
