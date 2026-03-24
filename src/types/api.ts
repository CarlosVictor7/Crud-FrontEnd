export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  error?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  user: {
    id: string
    name: string
    email: string
    role: 'super_admin' | 'admin' | 'client'
    active: boolean
  }
  accessToken: string
  refreshToken: string
}

export interface RefreshResponse {
  accessToken: string
}
