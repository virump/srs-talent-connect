import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Consistent "nothing here yet" panel. An empty grid with no explanation
 * reads as a bug; this makes the state intentional and offers a next step.
 */
function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        'flex animate-fade-up flex-col items-center justify-center rounded-2xl border border-dashed bg-card/50 px-6 py-16 text-center',
        className
      )}
    >
      {Icon && (
        <div className="relative mb-5">
          <span className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl" aria-hidden="true" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border bg-background shadow-soft">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      )}
      <h3 className="text-base font-semibold">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-pretty text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export { EmptyState }
