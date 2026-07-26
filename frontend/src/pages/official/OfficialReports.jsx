import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ChevronRight, ChevronUp, MapPin } from 'lucide-react'
import { StatusBadge, SeverityBadge } from '@/components/ui/Badge'
import { CATEGORY_MAP, CORE_CATEGORIES, STATUSES, OFFICIAL_STATUS_FLOW } from '@/lib/constants'
import { getReports } from '@/services/api'
import { timeAgo } from '@/lib/format'
import { cn } from '@/lib/cn'

/**
 * OfficialReports — the report queue (Nova Circle PRD Feature 3 / Master §3.6).
 * View all reports, filter by category & status, sort, open details. Read-only
 * except for opening a report to change its status.
 */
export default function OfficialReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState(null)
  const [category, setCategory] = useState(null)
  const [sort, setSort] = useState('newest')
  const [query, setQuery] = useState('')

  useEffect(() => {
    getReports().then((data) => {
      setReports(data)
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(() => {
    let list = reports.filter((r) => {
      if (status && r.status !== status) return false
      if (category && r.category !== category) return false
      if (query) {
        const q = query.toLowerCase()
        if (!r.title.toLowerCase().includes(q) && !r.lga.toLowerCase().includes(q) && !r.id.toLowerCase().includes(q))
          return false
      }
      return true
    })
    const sorters = {
      newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      confirmed: (a, b) => b.confirmations - a.confirmations,
    }
    return [...list].sort(sorters[sort])
  }, [reports, status, category, query, sort])

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-h2 font-bold text-ink">Report Queue</h1>
          <p className="mt-1 text-slate">
            <span className="font-data font-semibold text-ink">{filtered.length}</span> of{' '}
            <span className="font-data">{reports.length}</span> reports
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2">
          <Search className="size-4 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, LGA, ID…"
            className="w-48 bg-transparent text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <FilterGroup
          options={[{ key: null, label: 'All statuses' }, ...OFFICIAL_STATUS_FLOW.map((k) => ({ key: k, label: STATUSES[k].label }))]}
          value={status}
          onChange={setStatus}
        />
        <span className="mx-1 hidden h-6 w-px bg-line sm:block" />
        <FilterGroup
          options={[{ key: null, label: 'All types' }, ...CORE_CATEGORIES.map((c) => ({ key: c.key, label: c.shortLabel }))]}
          value={category}
          onChange={setCategory}
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="ml-auto rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-medium text-slate focus:border-civic focus:outline-none"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="confirmed">Most confirmed</option>
        </select>
      </div>

      {/* List */}
      <div className="mt-5 overflow-hidden rounded-panel border border-line bg-white shadow-e1">
        {loading ? (
          <div className="divide-y divide-line">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="size-11 animate-pulse rounded-xl bg-slate/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate/10" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-slate/10" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted">No reports match these filters.</div>
        ) : (
          <ul className="divide-y divide-line">
            {filtered.map((r) => {
              const cat = CATEGORY_MAP[r.category]
              const Icon = cat?.icon
              return (
                <li key={r.id}>
                  <Link to={`/official/reports/${r.id}`} className="flex items-center gap-4 p-4 transition-colors hover:bg-surface">
                    <span className="hidden size-11 shrink-0 place-items-center rounded-xl bg-civic/10 text-civic-600 sm:grid">
                      {Icon && <Icon className="size-5" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-semibold text-ink">{r.title}</h3>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3.5" /> {r.lga}, {r.state}
                        </span>
                        <span className="font-data text-xs">{r.id}</span>
                        <span>{timeAgo(r.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="hidden items-center gap-1 font-data text-sm font-semibold text-slate sm:flex">
                        <ChevronUp className="size-4 text-success" /> {r.confirmations}
                      </span>
                      <SeverityBadge severity={r.severity} className="hidden md:inline-flex" />
                      <StatusBadge status={r.status} size="sm" />
                      <ChevronRight className="size-5 text-muted" />
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

function FilterGroup({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.label}
          onClick={() => onChange(opt.key)}
          className={cn(
            'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
            value === opt.key
              ? 'border-civic bg-civic/10 text-civic-600'
              : 'border-line bg-white text-slate hover:border-civic/40',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
