import { cn } from '@/lib/cn'

/**
 * SectionHeading — consistent eyebrow + title + description block used to open
 * every landing section. Keeps vertical rhythm and type scale uniform.
 */
export function SectionHeading({ eyebrow, title, description, align = 'left', className, children }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      {eyebrow && (
        <span className="text-sm font-semibold uppercase tracking-wide text-civic-600">{eyebrow}</span>
      )}
      <div className={cn('flex items-end justify-between gap-4', align === 'center' && 'flex-col')}>
        <h2 className="max-w-2xl text-h2 font-bold text-ink">{title}</h2>
        {children}
      </div>
      {description && (
        <p className={cn('max-w-2xl text-lg text-slate', align === 'center' && 'mx-auto')}>
          {description}
        </p>
      )}
    </div>
  )
}
