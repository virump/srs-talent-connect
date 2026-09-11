'use client'

import * as React from 'react'
import { Search, X } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * Input with optional leading/trailing adornments and an error state.
 * Plain `<Input />` usage is unchanged from before.
 */
const Input = React.forwardRef(
  ({ className, type, icon: Icon, trailing, error = false, wrapperClassName, ...props }, ref) => {
    const field = (
      <input
        type={type}
        aria-invalid={error || undefined}
        className={cn(
          'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-soft transition-all duration-200',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
          'placeholder:text-muted-foreground/70',
          'hover:border-primary/30',
          'focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:ring-offset-0',
          'disabled:cursor-not-allowed disabled:opacity-50',
          Icon && 'pl-9',
          trailing && 'pr-9',
          error &&
            'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/25',
          className
        )}
        ref={ref}
        {...props}
      />
    )

    if (!Icon && !trailing) return field

    return (
      <div className={cn('relative w-full', wrapperClassName)}>
        {Icon && (
          <Icon
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
        )}
        {field}
        {trailing && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">{trailing}</div>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

/**
 * Search field with a live clear button — small affordance, big usability win
 * over a bare text input for filtering grids.
 */
const SearchInput = React.forwardRef(
  ({ value, onChange, onClear, className, wrapperClassName, ...props }, ref) => (
    <Input
      ref={ref}
      type="search"
      value={value}
      onChange={onChange}
      icon={Search}
      wrapperClassName={wrapperClassName}
      className={cn('[&::-webkit-search-cancel-button]:hidden', className)}
      trailing={
        value ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => (onClear ? onClear() : onChange?.({ target: { value: '' } }))}
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null
      }
      {...props}
    />
  )
)
SearchInput.displayName = 'SearchInput'

export { Input, SearchInput }
