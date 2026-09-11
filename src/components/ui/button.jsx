import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  // Shared: tactile press feedback, smooth transitions, clear focus ring.
  'relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 ease-out-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-soft hover:bg-primary/90 hover:shadow-glow',
        brand:
          'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-soft hover:from-brand-500 hover:to-brand-400 hover:shadow-glow',
        destructive:
          'bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/90',
        success: 'bg-success text-success-foreground shadow-soft hover:bg-success/90',
        outline:
          'border border-input bg-background shadow-soft hover:border-primary/40 hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-soft hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        subtle: 'bg-primary/10 text-primary hover:bg-primary/20',
        link: 'text-primary underline-offset-4 hover:underline active:scale-100',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-lg px-6',
        xl: 'h-12 rounded-xl px-8 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

const Button = React.forwardRef(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      loadingText,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'

    // Slot requires exactly one child, so never inject a spinner in asChild mode.
    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Comp>
      )
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && <Loader2 className="animate-spin" aria-hidden="true" />}
        {loading && loadingText ? loadingText : children}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
