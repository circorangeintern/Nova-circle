import { Suspense, lazy, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Maximize2, MapPin } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { MapLegend } from '@/components/map/MapLegend'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/common/Reveal'
import { getReports } from '@/services/api'

// Lazy-load the map bundle so it never blocks first paint (Landing dev notes).
const ReportMap = lazy(() =>
  import('@/components/map/ReportMap').then((m) => ({ default: m.ReportMap })),
)

export function MapPreview() {
  const [reports, setReports] = useState([])

  useEffect(() => {
    let alive = true
    getReports().then((data) => alive && setReports(data))
    return () => {
      alive = false
    }
  }, [])

  return (
    <section className="container-page py-16 sm:py-20">
      <SectionHeading
        eyebrow="The living accountability map"
        title="See what's broken, where"
        description="Every report is geotagged and colour-coded by status — reported, acknowledged, in progress or resolved. Explore the full interactive map."
      >
        <Button as={Link} to="/map" iconRight={Maximize2} className="hidden sm:inline-flex">
          Open full map
        </Button>
      </SectionHeading>

      <Reveal className="mt-8">
        <div className="relative overflow-hidden rounded-panel border border-line shadow-e2">
          <div className="h-[380px] w-full sm:h-[460px]">
            <Suspense fallback={<MapSkeleton />}>
              <ReportMap reports={reports} />
            </Suspense>
          </div>

          {/* Legend overlay */}
          <MapLegend className="absolute bottom-4 left-4 z-[1000] max-w-[calc(100%-2rem)]" />

          {/* Report count chip */}
          <div className="absolute right-4 top-4 z-[1000] inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-sm font-semibold text-ink shadow-e2 backdrop-blur">
            <MapPin className="size-4 text-civic-600" />
            <span className="font-data">{reports.length}</span> reports in view
          </div>
        </div>
      </Reveal>
    </section>
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
