import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/domain'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isBootstrapping: boolean
  setSession: (payload: { user: User; accessToken: string; refreshToken: string }) => void
  setAccessToken: (accessToken: string | null) => void
  setUser: (user: User | null) => void
  startBootstrap: () => void
  finishBootstrap: () => void
  logout: () => void
}

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isBootstrapping: true,
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,
      setSession: ({ user, accessToken, refreshToken }) =>
        set({ user, accessToken, refreshToken, isBootstrapping: false }),
      setAccessToken: (accessToken) => set({ accessToken }),
      setUser: (user) => set({ user }),
      startBootstrap: () => set({ isBootstrapping: true }),
      finishBootstrap: () => set({ isBootstrapping: false }),
      logout: () => set({ ...initialState, isBootstrapping: false }),
    }),
    {
      name: 'lobocore-session',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
)
