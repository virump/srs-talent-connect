'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Pointer-tracked radial glow. Writes coordinates to CSS custom properties
 * rather than re-rendering, and only listens while the pointer is inside.
 * Disabled on touch/reduced-motion, where a hover glow has no meaning.
 */
export function HeroSpotlight({ className }) {
  const ref = React.useRef(null)
  const [active, setActive] = React.useState(false)
  const [enabled, setEnabled] = React.useState(false)

  React.useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setEnabled(fine && !reduced)
  }, [])

  React.useEffect(() => {
    if (!enabled) return

    const node = ref.current
    if (!node) return

    const parent = node.parentElement
    if (!parent) return

    let frame = null

    const onMove = (event) => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = null
        const rect = parent.getBoundingClientRect()
        node.style.setProperty('--x', `${event.clientX - rect.left}px`)
        node.style.setProperty('--y', `${event.clientY - rect.top}px`)
      })
    }

    const onEnter = () => setActive(true)
    const onLeave = () => setActive(false)

    parent.addEventListener('pointermove', onMove)
    parent.addEventListener('pointerenter', onEnter)
    parent.addEventListener('pointerleave', onLeave)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      parent.removeEventListener('pointermove', onMove)
      parent.removeEventListener('pointerenter', onEnter)
      parent.removeEventListener('pointerleave', onLeave)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 transition-opacity duration-500',
        active ? 'opacity-100' : 'opacity-0',
        className
      )}
      style={{
        background:
          'radial-gradient(400px circle at var(--x, 50%) var(--y, 50%), hsl(var(--brand-500) / 0.14), transparent 65%)',
      }}
    />
  )
}
