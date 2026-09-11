import * as React from 'react'
import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground shadow-soft',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground shadow-soft',
        outline: 'text-foreground',
        // Soft, tinted status styles read better on dense list rows than solid fills
        success:
          'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-300',
        warning:
          'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/15 dark:text-amber-300',
        info: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/25 dark:bg-sky-500/15 dark:text-sky-300',
        brand:
          'border-brand-200 bg-brand-100 text-brand-700 dark:border-brand-300/25 dark:bg-brand-500/15',
        muted: 'border-transparent bg-muted text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

/** Maps arbitrary backend status strings onto a badge variant. */
const statusVariantMap = {
  published: 'success',
  active: 'success',
  accepted: 'success',
  completed: 'success',
  approved: 'success',
  pending: 'warning',
  review: 'warning',
  in_progress: 'info',
  draft: 'muted',
  archived: 'muted',
  closed: 'muted',
  rejected: 'destructive',
  cancelled: 'destructive',
}

function statusVariant(status) {
  if (!status) return 'secondary'
  return statusVariantMap[String(status).toLowerCase()] ?? 'secondary'
}

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

/** Convenience wrapper that picks its own colour from a status string. */
function StatusBadge({ status, className, ...props }) {
  return (
    <Badge variant={statusVariant(status)} className={cn('capitalize', className)} {...props}>
      {String(status ?? 'unknown').replace(/_/g, ' ')}
    </Badge>
  )
}

export { Badge, StatusBadge, badgeVariants, statusVariant }
