'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

const sideClasses = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
}

/**
 * Dependency-free tooltip. Shows on hover *and* keyboard focus so it is
 * reachable without a pointer. Purely decorative labels only — anything
 * essential should also live in an aria-label on the trigger.
 */
function Tooltip({
  children,
  content,
  side = 'top',
  className,
  wrapperClassName,
  delay = 150,
}) {
  const [open, setOpen] = React.useState(false)
  const timer = React.useRef(null)

  const show = () => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setOpen(true), delay)
  }

  const hide = () => {
    clearTimeout(timer.current)
    setOpen(false)
  }

  React.useEffect(() => () => clearTimeout(timer.current), [])

  if (!content) return children

  return (
    <span
      className={cn('relative inline-flex', wrapperClassName)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute z-[60] whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-lift transition-all duration-150',
          sideClasses[side],
          open ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
          className
        )}
      >
        {content}
      </span>
    </span>
  )
}

export { Tooltip }
