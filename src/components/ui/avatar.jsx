'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

const sizes = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
}

/** Deterministic gradient per user so avatars stay stable between renders. */
const gradients = [
  'from-violet-500 to-indigo-500',
  'from-sky-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-pink-500 to-rose-500',
  'from-fuchsia-500 to-purple-500',
]

function hashString(str = '') {
  let hash = 0
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function initialsOf(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Avatar with graceful degradation: image -> initials on a deterministic
 * gradient. Avoids the broken-image icon the old navbar could show.
 */
const Avatar = React.forwardRef(
  ({ className, src, name, size = 'md', ring = false, status, ...props }, ref) => {
    const [failed, setFailed] = React.useState(false)
    const showImage = Boolean(src) && !failed
    const gradient = gradients[hashString(name || 'user') % gradients.length]

    return (
      <span
        ref={ref}
        className={cn(
          'relative inline-flex shrink-0 select-none items-center justify-center overflow-visible rounded-full',
          sizes[size],
          className
        )}
        {...props}
      >
        <span
          className={cn(
            'flex h-full w-full items-center justify-center overflow-hidden rounded-full',
            ring && 'ring-2 ring-background ring-offset-2 ring-offset-primary/40'
          )}
        >
          {showImage ? (
            <img
              src={src}
              alt={name || 'User avatar'}
              onError={() => setFailed(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className={cn(
                'flex h-full w-full items-center justify-center bg-gradient-to-br font-semibold text-white',
                gradient
              )}
            >
              {initialsOf(name)}
            </span>
          )}
        </span>

        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 block rounded-full border-2 border-background',
              size === 'xs' || size === 'sm' ? 'h-2 w-2' : 'h-3 w-3',
              status === 'online' && 'bg-emerald-500',
              status === 'busy' && 'bg-amber-500',
              status === 'offline' && 'bg-muted-foreground'
            )}
          />
        )}
        {!showImage && <span className="sr-only">{name}</span>}
      </span>
    )
  }
)
Avatar.displayName = 'Avatar'

export { Avatar, initialsOf }
