'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

const barColors = {
  brand: 'bg-gradient-to-r from-brand-500 to-brand-600',
  success: 'bg-gradient-to-r from-emerald-400 to-emerald-600',
  warning: 'bg-gradient-to-r from-amber-400 to-amber-500',
  info: 'bg-gradient-to-r from-sky-400 to-sky-600',
}

const barSizes = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
}

/**
 * Linear progress bar. Animates from 0 to `value` on mount so the
 * number feels earned rather than simply rendered.
 */
const Progress = React.forwardRef(
  (
    {
      className,
      value = 0,
      variant = 'brand',
      size = 'md',
      indeterminate = false,
      showLabel = false,
      label,
      ...props
    },
    ref
  ) => {
    const target = Math.min(100, Math.max(0, Number(value) || 0))
    const [width, setWidth] = React.useState(0)

    React.useEffect(() => {
      // Defer a frame so the transition has a 0 -> target delta to animate.
      const frame = requestAnimationFrame(() => setWidth(target))
      return () => cancelAnimationFrame(frame)
    }, [target])

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {(showLabel || label) && (
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground">{label}</span>
            {showLabel && !indeterminate && (
              <span className="font-semibold tabular-nums text-foreground">{target}%</span>
            )}
          </div>
        )}
        <div
          role="progressbar"
          aria-valuenow={indeterminate ? undefined : target}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={typeof label === 'string' ? label : 'Progress'}
          className={cn(
            'relative w-full overflow-hidden rounded-full bg-muted',
            barSizes[size]
          )}
        >
          {indeterminate ? (
            <div
              className={cn(
                'absolute inset-y-0 w-1/2 animate-indeterminate-bar rounded-full',
                barColors[variant]
              )}
            />
          ) : (
            <div
              className={cn(
                'h-full rounded-full transition-[width] duration-700 ease-out-expo',
                barColors[variant]
              )}
              style={{ width: `${width}%` }}
            />
          )}
        </div>
      </div>
    )
  }
)
Progress.displayName = 'Progress'

/**
 * Circular progress ring — used for compact dashboard stats.
 * Pure SVG, no dependency, animates via stroke-dashoffset.
 */
const ProgressRing = React.forwardRef(
  (
    { className, value = 0, size = 72, strokeWidth = 7, variant = 'brand', children, ...props },
    ref
  ) => {
    const target = Math.min(100, Math.max(0, Number(value) || 0))
    const [progress, setProgress] = React.useState(0)

    React.useEffect(() => {
      const frame = requestAnimationFrame(() => setProgress(target))
      return () => cancelAnimationFrame(frame)
    }, [target])

    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (progress / 100) * circumference

    const strokeColors = {
      brand: 'stroke-brand-500',
      success: 'stroke-emerald-500',
      warning: 'stroke-amber-500',
      info: 'stroke-sky-500',
    }

    return (
      <div
        ref={ref}
        className={cn('relative inline-flex items-center justify-center', className)}
        style={{ width: size, height: size }}
        {...props}
      >
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            className="fill-none stroke-muted"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn(
              'fill-none transition-[stroke-dashoffset] duration-1000 ease-out-expo',
              strokeColors[variant]
            )}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {children ?? (
            <span className="text-sm font-semibold tabular-nums">{target}%</span>
          )}
        </div>
      </div>
    )
  }
)
ProgressRing.displayName = 'ProgressRing'

export { Progress, ProgressRing }
