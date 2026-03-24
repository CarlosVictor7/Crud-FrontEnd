import http from '../lib/http';
import type { ApiResponse } from '../types/api';
import type { ClientRecord } from '../types/domain';

export interface ClientPayload {
  name: string;
  phone: string;
  email?: string;
  document?: string;
}

export const clientsService = {
  async list(params?: { active?: boolean; search?: string }) {
    const response = await http.get<ApiResponse<ClientRecord[]>>('/clients', {
      params: {
        active: typeof params?.active === 'boolean' ? String(params.active) : undefined,
        search: params?.search
      }
    });
    return response.data.data;
  },

  async create(payload: ClientPayload) {
    const response = await http.post<ApiResponse<ClientRecord>>('/clients', payload);
    return response.data.data;
  },

  async update(id: string, payload: Partial<ClientPayload>) {
    const response = await http.put<ApiResponse<ClientRecord>>(`/clients/${id}`, payload);
    return response.data.data;
  },

  async patchStatus(id: string, active: boolean) {
    const response = await http.patch<ApiResponse<ClientRecord>>(`/clients/${id}/status`, { active });
    return response.data.data;
  },

  async remove(id: string) {
    await http.delete(`/clients/${id}`);
  }
};
