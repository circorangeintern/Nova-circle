import { STATUSES } from '@/lib/constants'
import { cn } from '@/lib/cn'

/** MapLegend — status colour key (never rely on colour alone; label included). */
export function MapLegend({ className }) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-line bg-white/95 px-4 py-2.5 shadow-e2 backdrop-blur',
        className,
      )}
    >
      {Object.values(STATUSES).map((s) => (
        <span key={s.key} className="inline-flex items-center gap-1.5 text-xs font-medium text-slate">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: s.color }} />
          {s.label}
        </span>
      ))}
    </div>
  )
}
