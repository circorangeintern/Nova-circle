import { cn } from '@/lib/cn'

/** Brand lockup: supplied eye image + "PublicEye NG". */
export function Logo({ className, onDark = true }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <img src="/publiceye-logo.png" alt="" width="36" height="36" className="size-9 rounded-full bg-white object-cover shadow-e1" />
      <span
        className={cn(
          'font-display text-xl font-bold tracking-tight',
          onDark ? 'text-white' : 'text-ink',
        )}
      >
        PublicEye <span className="text-accent">NG</span>
      </span>
    </span>
  )
}
