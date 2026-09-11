'use client'

import * as React from 'react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

/**
 * Counts up to `value` on mount using requestAnimationFrame with an
 * ease-out curve. Skips the animation entirely for users who asked for
 * reduced motion, and always ends exactly on `value`.
 */
function useCountUp(value, duration = 900) {
  const target = Number(value) || 0
  const [display, setDisplay] = React.useState(0)

  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced || target === 0) {
      setDisplay(target)
      return
    }

    let raf
    const start = performance.now()

    const tick = (now) => {
      const elapsed = now - start
      const t = Math.min(1, elapsed / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(target * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return display
}

function AnimatedNumber({ value, prefix = '', suffix = '', className }) {
  const display = useCountUp(value)
  return (
    <span className={cn('tabular-nums', className)}>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  )
}

const toneStyles = {
  brand: {
    icon: 'bg-brand-100 text-brand-700',
    accent: 'from-brand-500/10',
  },
  success: {
    icon: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    accent: 'from-emerald-500/10',
  },
  warning: {
    icon: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    accent: 'from-amber-500/10',
  },
  info: {
    icon: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
    accent: 'from-sky-500/10',
  },
}

/**
 * Dashboard metric tile: animated value, optional trend chip and progress bar.
 */
function StatCard({
  label,
  value,
  prefix,
  suffix,
  icon: Icon,
  tone = 'brand',
  hint,
  trend,
  progress,
  progressLabel,
  className,
}) {
  const styles = toneStyles[tone] ?? toneStyles.brand
  const trendUp = typeof trend === 'number' && trend >= 0

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-card p-5 shadow-card transition-all duration-300 ease-out-expo hover:-translate-y-1 hover:shadow-lift',
        className
      )}
    >
      {/* Subtle tinted wash that intensifies on hover */}
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-100',
          styles.accent
        )}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {Icon && (
            <span
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110',
                styles.icon
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
          )}
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-3xl font-bold tracking-tight">
            <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
          </p>
          {typeof trend === 'number' && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold',
                trendUp
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
              )}
            >
              {trendUp ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(trend)}%
            </span>
          )}
        </div>

        {typeof progress === 'number' && (
          <Progress
            value={progress}
            size="sm"
            variant={tone}
            className="mt-4"
            label={progressLabel}
          />
        )}

        {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  )
}

export { StatCard, AnimatedNumber, useCountUp }
