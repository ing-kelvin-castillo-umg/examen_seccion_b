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
  accessToken: string;
  refreshToken: string;
  user: User;
  isAuthenticated: boolean;
  isAdmin: boolean;
}
