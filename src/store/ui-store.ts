import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Theme } from '@/lib/theme'
import { getStoredTheme } from '@/lib/theme'

interface UiState {
  isSidebarCollapsed: boolean
  isMobileSidebarOpen: boolean
  theme: Theme
  toggleSidebar: () => void
  setMobileSidebar: (isOpen: boolean) => void
  setTheme: (theme: Theme) => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      isSidebarCollapsed: false,
      isMobileSidebarOpen: false,
      theme: getStoredTheme(),
      toggleSidebar: () => set({ isSidebarCollapsed: !get().isSidebarCollapsed }),
      setMobileSidebar: (isOpen) => set({ isMobileSidebarOpen: isOpen }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'lobocore-ui',
      partialize: (state) => ({
        isSidebarCollapsed: state.isSidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
)
