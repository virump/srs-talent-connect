'use client'

import { Toaster as SonnerToaster } from 'sonner'
import { useTheme } from '@/components/providers/theme-provider'

/**
 * Sonner wired to the app theme and to our design tokens, so toasts inherit
 * dark mode instead of staying hard-coded white.
 */
export function Toaster() {
  const { resolvedTheme } = useTheme()

  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      theme={resolvedTheme}
      className="toaster group"
      expand={false}
      duration={4000}
      offset={76}
      toastOptions={{
        classNames: {
          toast:
            'group toast rounded-xl border border-border bg-card text-card-foreground shadow-lift',
          title: 'text-sm font-semibold',
          description: 'text-sm text-muted-foreground',
          actionButton: 'bg-primary text-primary-foreground rounded-md',
          cancelButton: 'bg-muted text-muted-foreground rounded-md',
          closeButton: 'bg-card border-border text-muted-foreground hover:text-foreground',
        },
      }}
    />
  )
}
