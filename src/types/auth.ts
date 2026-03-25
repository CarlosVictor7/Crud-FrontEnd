export type UserRole = 'super_admin' | 'admin' | 'client';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  lastLoginAt?: string | null;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}

export const ACCESS_TOKEN_KEY = 'lobocore_token';
export const REFRESH_TOKEN_KEY = 'lobocore_refresh_token';
