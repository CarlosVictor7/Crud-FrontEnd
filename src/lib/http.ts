import axios, { type InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '../types/api';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, type RefreshResponse } from '../types/auth';

const http = axios.create({
  baseURL: '/api',
  timeout: 15000
});

const authlessPaths = ['/auth/login', '/auth/refresh'];

let refreshPromise: Promise<string | null> | null = null;

export const tokenStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

http.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await axios.post<ApiResponse<RefreshResponse>>('/api/auth/refresh', {
      refreshToken
    });

    const nextAccessToken = response.data.data.accessToken;
    localStorage.setItem(ACCESS_TOKEN_KEY, nextAccessToken);
    return nextAccessToken;
  } catch {
    tokenStorage.clear();
    return null;
  }
};

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status as number | undefined;
    const path = originalRequest?.url ?? '';

    if (!originalRequest || status !== 401 || originalRequest._retry || authlessPaths.some((authPath) => path.includes(authPath))) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    const newToken = await refreshPromise;
    if (!newToken) {
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${newToken}`;
    return http(originalRequest);
  }
);

export default http;
