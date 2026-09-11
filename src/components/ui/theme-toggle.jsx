'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/providers/theme-provider'
import { cn } from '@/lib/utils'

/**
 * Sun/moon toggle that cross-fades and rotates between states.
 * Renders a static placeholder until mounted so SSR markup matches the client.
 */
export function ThemeToggle({ className }) {
  const { resolvedTheme, toggleTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={cn(
        'relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground active:scale-95',
        className
      )}
    >
      <Sun
        aria-hidden="true"
        className={cn(
          'absolute h-[18px] w-[18px] transition-all duration-300 ease-out-expo',
          isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
        )}
      />
      <Moon
        aria-hidden="true"
        className={cn(
          'absolute h-[18px] w-[18px] transition-all duration-300 ease-out-expo',
          isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
        )}
      />
    </button>
  )
}
