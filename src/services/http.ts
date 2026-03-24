import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse, RefreshResponse } from '@/types/api'
import { useAuthStore } from '@/store/auth-store'

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

const baseURL = '/api'

const http = axios.create({
  baseURL,
  timeout: 15000,
})

let refreshPromise: Promise<string | null> | null = null

const refreshAccessToken = async (): Promise<string | null> => {
  const { refreshToken, logout, setAccessToken } = useAuthStore.getState()

  if (!refreshToken) {
    logout()
    return null
  }

  try {
    const response = await axios.post<ApiResponse<RefreshResponse>>(`${baseURL}/auth/refresh`, {
      refreshToken,
    })

    const newAccessToken = response.data.data.accessToken
    setAccessToken(newAccessToken)
    return newAccessToken
  } catch {
    logout()
    return null
  }
}

http.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined

    if (!originalRequest) {
      return Promise.reject(error)
    }

    const status = error.response?.status
    const isAuthRefreshRoute = originalRequest.url?.includes('/auth/refresh')

    if (status !== 401 || originalRequest._retry || isAuthRefreshRoute) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    if (!refreshPromise) {
      refreshPromise = refreshAccessToken()
      refreshPromise.finally(() => {
        refreshPromise = null
      })
    }

    const newAccessToken = await refreshPromise

    if (!newAccessToken) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }

    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
    return http.request(originalRequest)
  }
)

export default http
