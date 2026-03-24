import http, { tokenStorage } from '../lib/http';
import type { ApiResponse } from '../types/api';
import type { AuthUser, LoginResponse } from '../types/auth';

export const authService = {
  async login(payload: { email: string; password: string }) {
    const response = await http.post<ApiResponse<LoginResponse>>('/auth/login', payload);
    const data = response.data.data;
    tokenStorage.setTokens(data.accessToken, data.refreshToken);
    return data;
  },

  async me() {
    const response = await http.get<ApiResponse<AuthUser>>('/auth/me');
    return response.data.data;
  },

  logout() {
    tokenStorage.clear();
  }
};
