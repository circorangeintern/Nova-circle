import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'
import { MapLegend } from '@/components/map/MapLegend'
import { cn } from '@/lib/cn'

// The Leaflet bundle (~46KB gzip) is loaded only when the map scrolls into
// view, so it never blocks the summary cards or the reports list.
const ReportMap = lazy(() =>
  import('@/components/map/ReportMap').then((m) => ({ default: m.ReportMap })),
)

/**
 * DashboardMap — geographic view of the (filtered) public reports (Feature 4).
 * Markers are status-coloured and clickable; each popup links through to the
 * full report. Read-only: no editing affordances anywhere on this map.
 */
export function DashboardMap({ reports = [], className }) {
  const [loadMap, setLoadMap] = useState(false)
  const holder = useRef(null)

  // Only geotagged reports can be pinned — guard so one malformed record can
  // never blank the whole map.
  const mappable = reports.filter(
    (r) => Number.isFinite(r.coordinates?.lat) && Number.isFinite(r.coordinates?.lng),
  )

  useEffect(() => {
    const target = holder.current
    if (!target) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoadMap(true)
          observer.disconnect()
        }
      },
      { rootMargin: '300px' },
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-panel border border-line shadow-e2',
        className,
      )}
    >
      <div ref={holder} className="h-[420px] w-full sm:h-[520px]">
        {loadMap ? (
          <Suspense fallback={<MapSkeleton />}>
            <ReportMap reports={mappable} scrollWheelZoom={false} />
          </Suspense>
        ) : (
          <MapSkeleton />
        )}
      </div>

      <MapLegend className="absolute bottom-4 left-4 z-[1000] max-w-[calc(100%-2rem)]" />

      <div className="absolute right-4 top-4 z-[1000] inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-sm font-semibold text-ink shadow-e2 backdrop-blur">
        <MapPin className="size-4 text-civic-600" aria-hidden />
        <span className="font-data">{mappable.length}</span>
        {mappable.length === 1 ? ' report' : ' reports'} mapped
      </div>
    </div>
  )
}

function MapSkeleton() {
  return (
    <div className="flex size-full items-center justify-center bg-[#eef2f7]">
      <div className="flex flex-col items-center gap-3 text-muted">
        <div className="size-8 animate-spin rounded-full border-2 border-civic-400 border-t-transparent" />
        <span className="text-sm">Loading map…</span>
      </div>
    </div>
  )
}
