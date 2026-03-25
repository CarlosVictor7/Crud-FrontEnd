import http from '../lib/http';
import type { ApiResponse } from '../types/api';
import type { UserRole } from '../types/auth';

export interface UserRecord {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  active?: boolean;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: UserRole;
}

export const usersService = {
  async list(params?: { active?: boolean; search?: string; role?: UserRole }) {
    const response = await http.get<ApiResponse<UserRecord[]>>('/users', {
      params: {
        active: typeof params?.active === 'boolean' ? String(params.active) : undefined,
        search: params?.search,
        role: params?.role,
      },
    });
    return response.data.data;
  },

  async getById(id: string) {
    const response = await http.get<ApiResponse<UserRecord>>(`/users/${id}`);
    return response.data.data;
  },

  async create(payload: CreateUserPayload) {
    const response = await http.post<ApiResponse<UserRecord>>('/users', payload);
    return response.data.data;
  },

  async update(id: string, payload: UpdateUserPayload) {
    const response = await http.put<ApiResponse<UserRecord>>(`/users/${id}`, payload);
    return response.data.data;
  },

  async patchStatus(id: string, active: boolean) {
    const response = await http.patch<ApiResponse<UserRecord>>(`/users/${id}/status`, { active });
    return response.data.data;
  },

  async patchPassword(id: string, password: string) {
    await http.patch(`/users/${id}/password`, { password });
  },

  async remove(id: string) {
    await http.delete(`/users/${id}`);
  },
};
