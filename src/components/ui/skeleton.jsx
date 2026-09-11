import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Shimmering placeholder used while data is in flight.
 * Prefer this over a bare "Loading..." string: it preserves layout
 * and communicates the shape of the content that is about to arrive.
 */
function Skeleton({ className, shape = 'rect', ...props }) {
  return (
    <div
      className={cn(
        'shimmer bg-muted/70',
        shape === 'rect' && 'rounded-lg',
        shape === 'text' && 'h-4 rounded-md',
        shape === 'circle' && 'rounded-full',
        className
      )}
      {...props}
    />
  )
}

/** Convenience: a block of fake text lines with a shorter last line. */
function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          shape="text"
          className={i === lines - 1 ? 'w-2/3' : 'w-full'}
        />
      ))}
    </div>
  )
}

/** Card-shaped skeleton matching the course/opportunity card layout. */
function SkeletonCard({ className, media = true }) {
  return (
    <div className={cn('overflow-hidden rounded-xl border bg-card shadow-card', className)}>
      {media && <Skeleton className="h-44 w-full rounded-none" />}
      <div className="space-y-3 p-5">
        <Skeleton shape="text" className="h-5 w-3/4" />
        <Skeleton shape="text" className="w-1/3" />
        <SkeletonText lines={2} />
        <div className="flex items-center justify-between pt-2">
          <Skeleton shape="text" className="w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  )
}

export { Skeleton, SkeletonText, SkeletonCard }
