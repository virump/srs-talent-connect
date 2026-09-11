'use client'

import * as React from 'react'

const STORAGE_KEY = 'srs-theme'

const ThemeContext = React.createContext({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
})

/**
 * Class-based dark mode with three states: 'light' | 'dark' | 'system'.
 * The initial paint is handled by the inline script in layout.jsx, so this
 * provider only needs to keep React state in sync and react to changes.
 */
export function ThemeProvider({ children, defaultTheme = 'system' }) {
  const [theme, setThemeState] = React.useState(defaultTheme)
  const [systemTheme, setSystemTheme] = React.useState('light')

  // Read the persisted choice once on mount.
  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      setThemeState(stored)
    }
  }, [])

  // Track the OS preference so 'system' stays live.
  React.useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const sync = () => setSystemTheme(media.matches ? 'dark' : 'light')
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  const resolvedTheme = theme === 'system' ? systemTheme : theme

  // Apply the class and keep the native UI (scrollbars, form controls) in step.
  React.useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', resolvedTheme === 'dark')
    root.style.colorScheme = resolvedTheme
  }, [resolvedTheme])

  const setTheme = React.useCallback((next) => {
    setThemeState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Storage can be unavailable (private mode); theme still applies for the session.
    }
  }, [])

  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }, [resolvedTheme, setTheme])

  const value = React.useMemo(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme, setTheme, toggleTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => React.useContext(ThemeContext)

/**
 * Runs before first paint to prevent a light-mode flash on dark-mode loads.
 * Kept tiny and dependency-free because it is inlined into the document head.
 */
export const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('${STORAGE_KEY}');
    var isDark = stored === 'dark' ||
      ((!stored || stored === 'system') &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  } catch (e) {}
})();
`
