import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, SlidersHorizontal, Camera, X } from 'lucide-react'
import { ReportMap } from '@/components/map/ReportMap'
import { MapLegend } from '@/components/map/MapLegend'
import { StatusBadge } from '@/components/ui/Badge'
import { STATUSES, CATEGORIES } from '@/lib/constants'
import { getReports } from '@/services/api'
import { cn } from '@/lib/cn'

/** Public interactive map (Master PRD §3.3 / PRD §5.3) — MVP slice. */
export default function MapPage() {
  const [reports, setReports] = useState([])
  const [statusFilter, setStatusFilter] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    getReports().then(setReports)
  }, [])

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      if (statusFilter && r.status !== statusFilter) return false
      if (categoryFilter && r.category !== categoryFilter) return false
      if (query) {
        const q = query.toLowerCase()
        if (
          !r.title.toLowerCase().includes(q) &&
          !r.lga.toLowerCase().includes(q) &&
          !r.state.toLowerCase().includes(q)
        )
          return false
      }
      return true
    })
  }, [reports, statusFilter, categoryFilter, query])

  const clearAll = () => {
    setStatusFilter(null)
    setCategoryFilter(null)
    setQuery('')
  }
  const hasFilters = statusFilter || categoryFilter || query

  return (
    <div className="relative h-[calc(100vh-68px)] w-full overflow-hidden">
      {/* Filter panel (desktop) */}
      <aside className="absolute left-4 top-4 z-[1000] hidden w-72 flex-col gap-4 rounded-panel border border-line bg-white/95 p-4 shadow-e3 backdrop-blur md:flex">
        <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2">
          <Search className="size-4 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search LGA, state, keyword…"
            className="w-full bg-transparent text-sm focus:outline-none"
            aria-label="Search reports"
          />
        </div>

        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
            <SlidersHorizontal className="size-4" /> Status
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {Object.values(STATUSES).map((s) => (
              <button
                key={s.key}
                onClick={() => setStatusFilter(statusFilter === s.key ? null : s.key)}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors',
                  statusFilter === s.key
                    ? 'border-transparent text-white'
                    : 'border-line bg-white text-slate hover:border-civic/40',
                )}
                style={statusFilter === s.key ? { backgroundColor: s.color } : undefined}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-ink">Category</h3>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.slice(0, 6).map((c) => (
              <button
                key={c.key}
                onClick={() => setCategoryFilter(categoryFilter === c.key ? null : c.key)}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                  categoryFilter === c.key
                    ? 'border-civic bg-civic/10 text-civic-600'
                    : 'border-line bg-white text-slate hover:border-civic/40',
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-line pt-3 text-sm">
          <span className="font-medium text-slate">
            <span className="font-data font-bold text-ink">{filtered.length}</span> shown
          </span>
          {hasFilters && (
            <button onClick={clearAll} className="inline-flex items-center gap-1 font-semibold text-civic-600 hover:underline">
              <X className="size-3.5" /> Reset
            </button>
          )}
        </div>
      </aside>

      {/* Mobile search bar */}
      <div className="absolute inset-x-4 top-4 z-[1000] md:hidden">
        <div className="flex items-center gap-2 rounded-full border border-line bg-white/95 px-4 py-2.5 shadow-e2 backdrop-blur">
          <Search className="size-4 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reports…"
            className="w-full bg-transparent text-sm focus:outline-none"
            aria-label="Search reports"
          />
        </div>
        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
          {Object.values(STATUSES).map((s) => (
            <button
              key={s.key}
              onClick={() => setStatusFilter(statusFilter === s.key ? null : s.key)}
              className="shrink-0"
            >
              <StatusBadge status={s.key} className={cn(statusFilter === s.key && 'ring-2 ring-offset-1', 'ring-current')} />
            </button>
          ))}
        </div>
      </div>

      <ReportMap reports={filtered} scrollWheelZoom className="z-0" />

      <MapLegend className="absolute bottom-6 left-1/2 z-[1000] hidden -translate-x-1/2 md:flex" />

      {/* Floating report button (always accessible, PRD §5.3) */}
      <Link
        to="/report"
        className="group absolute bottom-6 right-6 z-[1000] inline-flex items-center gap-2 rounded-full bg-accent px-5 py-4 font-semibold text-white shadow-e3 transition-transform hover:scale-105 active:scale-95"
        aria-label="Report an issue"
      >
        <Camera className="size-5" />
        <span className="hidden sm:inline">Report Issue</span>
      </Link>
    </div>
  )
}
