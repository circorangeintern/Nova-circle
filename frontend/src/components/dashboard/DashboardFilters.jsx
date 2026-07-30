import { SlidersHorizontal, X } from 'lucide-react'
import { CORE_CATEGORIES, OFFICIAL_STATUS_FLOW, STATUSES } from '@/lib/constants'
import { cn } from '@/lib/cn'

/**
 * DashboardFilters — category + status narrowing for the public dashboard
 * (Feature 3). Categories are the 4 MVP types (Road, School, Water,
 * Electricity); statuses follow the published flow order.
 *
 * Both filters are single-select toggles: clicking the active chip clears it.
 * They drive the reports list AND the map, so the two views never disagree.
 */
export function DashboardFilters({
  category,
  status,
  onCategoryChange,
  onStatusChange,
  onReset,
  resultCount,
  className,
}) {
  const hasFilters = Boolean(category || status)

  return (
    <div
      className={cn(
        'rounded-card border border-line bg-white p-4 shadow-card sm:p-5',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 font-sans text-sm font-bold uppercase tracking-wide text-ink">
          <SlidersHorizontal className="size-4 text-civic-600" aria-hidden />
          Filter reports
        </h2>
        <p className="text-sm text-muted" aria-live="polite">
          <span className="font-data font-bold text-ink">{resultCount}</span>{' '}
          {resultCount === 1 ? 'report' : 'reports'} shown
          {hasFilters && (
            <button
              onClick={onReset}
              className="ml-3 inline-flex items-center gap-1 font-semibold text-civic-600 hover:underline"
            >
              <X className="size-3.5" aria-hidden /> Clear filters
            </button>
          )}
        </p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {/* Category */}
        <fieldset>
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Category
          </legend>
          <div className="flex flex-wrap gap-1.5">
            {CORE_CATEGORIES.map((c) => {
              const Icon = c.icon
              const active = category === c.key
              return (
                <button
                  key={c.key}
                  onClick={() => onCategoryChange(active ? null : c.key)}
                  aria-pressed={active}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-colors',
                    active
                      ? 'border-civic bg-civic/10 text-civic-600'
                      : 'border-line bg-white text-slate hover:border-civic/40 hover:text-ink',
                  )}
                >
                  <Icon className="size-3.5" aria-hidden />
                  {c.shortLabel}
                </button>
              )
            })}
          </div>
        </fieldset>

        {/* Status */}
        <fieldset>
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Status
          </legend>
          <div className="flex flex-wrap gap-1.5">
            {OFFICIAL_STATUS_FLOW.map((key) => {
              const s = STATUSES[key]
              const active = status === key
              return (
                <button
                  key={key}
                  onClick={() => onStatusChange(active ? null : key)}
                  aria-pressed={active}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-colors',
                    active
                      ? 'border-transparent text-white'
                      : 'border-line bg-white text-slate hover:border-civic/40 hover:text-ink',
                  )}
                  style={active ? { backgroundColor: s.color } : undefined}
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: active ? '#fff' : s.color }}
                    aria-hidden
                  />
                  {s.label}
                </button>
              )
            })}
          </div>
        </fieldset>
      </div>
    </div>
  )
}
