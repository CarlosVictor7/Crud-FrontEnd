import { useEffect } from 'react'
import { persistTheme } from '@/lib/theme'
import { useUiStore } from '@/store/ui-store'

export function useTheme() {
  const theme = useUiStore((state) => state.theme)
  const setTheme = useUiStore((state) => state.setTheme)

  useEffect(() => {
    persistTheme(theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
  }
}
