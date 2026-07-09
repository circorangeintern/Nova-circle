import { Eye } from 'lucide-react'
import { cn } from '@/lib/cn'

/** Brand lockup: eye glyph in a blue rounded square + "PublicEye NG". */
export function Logo({ className, onDark = true }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="grid size-9 place-items-center rounded-full bg-civic-500 shadow-e1">
        <Eye className="size-5 text-white" strokeWidth={2.2} />
      </span>
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
