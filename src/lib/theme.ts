const STORAGE_KEY = 'lobocore-theme'

type Theme = 'light' | 'dark'

const getSystemTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  const storedTheme = window.localStorage.getItem(STORAGE_KEY)
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme
  }

  return getSystemTheme()
}

export const setThemeOnDocument = (theme: Theme) => {
  if (typeof document === 'undefined') {
    return
  }

  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
}

export const initTheme = () => {
  const theme = getStoredTheme()
  setThemeOnDocument(theme)
  return theme
}

export const persistTheme = (theme: Theme) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, theme)
  setThemeOnDocument(theme)
}

export type { Theme }
