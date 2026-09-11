import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const DIVISIONS = [
  { amount: 60, unit: 'second' },
  { amount: 60, unit: 'minute' },
  { amount: 24, unit: 'hour' },
  { amount: 7, unit: 'day' },
  { amount: 4.34524, unit: 'week' },
  { amount: 12, unit: 'month' },
  { amount: Number.POSITIVE_INFINITY, unit: 'year' },
]

/**
 * Relative time ("3 hours ago") using the built-in Intl API.
 * Replaces a call to date-fns' formatDistanceToNow, which was referenced in
 * the dashboard but never installed or imported.
 */
export function formatRelativeTime(date) {
  if (!date) return ''

  const parsed = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(parsed.getTime())) return ''

  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  let duration = (parsed.getTime() - Date.now()) / 1000

  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.unit)
    }
    duration /= division.amount
  }

  return parsed.toLocaleDateString()
}

/** Short absolute date, e.g. "12 Mar 2026". */
export function formatDate(date) {
  if (!date) return ''
  const parsed = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** Currency display that tolerates null/undefined prices from the DB. */
export function formatCurrency(value, currency = 'USD') {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount)
}

/** Safe percentage that never returns NaN or Infinity on a zero denominator. */
export function percentage(part, total) {
  const numerator = Number(part) || 0
  const denominator = Number(total) || 0
  if (denominator <= 0) return 0
  return Math.round(Math.min(100, Math.max(0, (numerator / denominator) * 100)))
}
