'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Reveals children when they scroll into view, once.
 * Falls back to visible immediately when IntersectionObserver is unavailable
 * or the user prefers reduced motion, so content is never trapped hidden.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  direction = 'up',
  threshold = 0.15,
  as: Tag = 'div',
}) {
  const ref = React.useRef(null)
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const node = ref.current
    if (!node) return

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold])

  const hidden = {
    up: 'translate-y-6',
    down: '-translate-y-6',
    left: 'translate-x-6',
    right: '-translate-x-6',
    none: 'scale-[0.98]',
  }[direction]

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        'transition-all duration-700 ease-out-expo motion-reduce:transition-none',
        visible ? 'translate-x-0 translate-y-0 scale-100 opacity-100' : cn('opacity-0', hidden),
        className
      )}
    >
      {children}
    </Tag>
  )
}
