import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * `interactive` opts a card into hover lift + border highlight. Use it only
 * for cards that actually do something on click, so motion stays meaningful.
 */
const Card = React.forwardRef(({ className, interactive = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-xl border bg-card text-card-foreground shadow-card',
      interactive &&
        'group cursor-pointer transition-all duration-300 ease-out-expo hover:-translate-y-1 hover:border-primary/30 hover:shadow-lift focus-within:border-primary/40',
      className
    )}
    {...props}
  />
))
Card.displayName = 'Card'

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('font-semibold leading-none tracking-tight', className)}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
))
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
