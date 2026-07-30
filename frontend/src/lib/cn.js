import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * cn — merge conditional class names while resolving Tailwind conflicts.
 * Usage: cn('px-4', condition && 'bg-civic', className)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
