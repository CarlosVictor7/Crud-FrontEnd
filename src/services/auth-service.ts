import http from '@/services/http'
import type { ApiResponse, LoginPayload, LoginResponse } from '@/types/api'
import type { User } from '@/types/domain'

export const authService = {
  login: async (payload: LoginPayload) => {
    const response = await http.post<ApiResponse<LoginResponse>>('/auth/login', payload)
    return response.data.data
  },
  me: async () => {
    const response = await http.get<ApiResponse<User>>('/auth/me')
    return response.data.data
  },
}
