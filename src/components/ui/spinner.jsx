import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const sizes = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
}

function Spinner({ className, size = 'md', label = 'Loading', ...props }) {
  return (
    <Loader2
      role="status"
      aria-label={label}
      className={cn('animate-spin text-muted-foreground', sizes[size], className)}
      {...props}
    />
  )
}

/** Centered spinner for full-panel loading states. */
function SpinnerOverlay({ className, label = 'Loading', size = 'lg' }) {
  return (
    <div className={cn('flex w-full flex-col items-center justify-center gap-3 py-16', className)}>
      <Spinner size={size} className="text-primary" label={label} />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

export { Spinner, SpinnerOverlay }
