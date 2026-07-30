import { Check } from 'lucide-react'
import { CORE_CATEGORIES, SEVERITIES } from '@/lib/constants'
import { cn } from '@/lib/cn'

/**
 * CategorySelector — large icon cards, single-select (Master PRD §3.2).
 * MVP shows only the 4 core categories (Nova Circle PRD).
 */
export function CategorySelector({ value, onChange, error }) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-ink">What type of issue is this?</legend>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {CORE_CATEGORIES.map((c) => {
          const selected = value === c.key
          const Icon = c.icon
          return (
            <button
              type="button"
              key={c.key}
              onClick={() => onChange(c.key)}
              aria-pressed={selected}
              className={cn(
                'flex flex-col items-center gap-2 rounded-card border-2 p-4 text-center transition-all duration-150',
                selected
                  ? 'border-civic-500 bg-civic/[0.06] shadow-e1'
                  : 'border-line bg-white hover:border-civic/40',
              )}
            >
              <span
                className={cn(
                  'grid size-11 place-items-center rounded-xl transition-colors',
                  selected ? 'bg-civic-500 text-white' : 'bg-civic/10 text-civic-600',
                )}
              >
                <Icon className="size-6" />
              </span>
              <span className={cn('text-sm font-semibold', selected ? 'text-civic-700' : 'text-slate')}>
                {c.shortLabel}
              </span>
            </button>
          )
        })}
      </div>
      {error && <p className="mt-2 text-sm font-medium text-critical">{error}</p>}
    </fieldset>
  )
}

/** SeveritySelector — Low / Medium / High / Critical with blurb (Master PRD §3.2). */
export function SeveritySelector({ value, onChange, error }) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-ink">How severe is it?</legend>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Object.values(SEVERITIES).map((s) => {
          const selected = value === s.key
          return (
            <button
              type="button"
              key={s.key}
              onClick={() => onChange(s.key)}
              aria-pressed={selected}
              className={cn(
                'relative rounded-card border-2 p-4 text-left transition-all duration-150',
                selected ? 'shadow-e1' : 'border-line bg-white hover:border-civic/40',
              )}
              style={selected ? { borderColor: s.color, backgroundColor: `${s.color}0d` } : undefined}
            >
              <span className="flex items-center gap-2">
                <span className="size-3 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="font-semibold text-ink">{s.label}</span>
                {selected && <Check className="ml-auto size-4" style={{ color: s.color }} strokeWidth={3} />}
              </span>
              <span className="mt-1 block text-xs text-muted">{s.blurb}</span>
            </button>
          )
        })}
      </div>
      {error && <p className="mt-2 text-sm font-medium text-critical">{error}</p>}
    </fieldset>
  )
}
