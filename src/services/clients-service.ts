import http from '@/services/http'
import type { ApiResponse } from '@/types/api'
import type { Client } from '@/types/domain'

export interface ClientPayload {
  name: string
  phone: string
  email?: string
  document?: string
}

export interface ClientsQuery {
  active?: 'true' | 'false'
  search?: string
}

export const clientsService = {
  list: async (params?: ClientsQuery) => {
    const response = await http.get<ApiResponse<Client[]>>('/clients', { params })
    return response.data.data
  },
  create: async (payload: ClientPayload) => {
    const response = await http.post<ApiResponse<Client>>('/clients', payload)
    return response.data.data
  },
  update: async (id: string, payload: Partial<ClientPayload>) => {
    const response = await http.put<ApiResponse<Client>>(`/clients/${id}`, payload)
    return response.data.data
  },
  updateStatus: async (id: string, active: boolean) => {
    const response = await http.patch<ApiResponse<Client>>(`/clients/${id}/status`, { active })
    return response.data.data
  },
  deleteDefinitive: async (id: string) => {
    const response = await http.delete<ApiResponse<null>>(`/clients/${id}`)
    return response.data
  },
}
