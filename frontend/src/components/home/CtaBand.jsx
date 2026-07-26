import { Link } from 'react-router-dom'
import { Camera, Map as MapIcon, Users, FileCheck2, Globe, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/common/Reveal'
import { TopoPattern } from './TopoPattern'

const TRUST = [
  { icon: Users, label: 'Supported by Local Communities' },
  { icon: FileCheck2, label: 'Transparent Public Records' },
  { icon: Globe, label: 'Open Accountability Platform' },
  { icon: Building2, label: 'Accessible Across Nigeria' },
]

/** CtaBand — closing call-to-action + trust indicators (Landing §3.1). */
export function CtaBand() {
  return (
    <section className="container-page pb-20">
      <Reveal>
        <div className="relative overflow-hidden rounded-panel bg-gradient-to-br from-navy-900 via-civic-600 to-civic-500 px-6 py-14 text-center shadow-e2 sm:px-12 sm:py-16">
          <TopoPattern className="pointer-events-none absolute inset-0 h-full w-full" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Your report becomes a permanent public record.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
              It takes under 90 seconds. Document an issue near you and help make its absence
              impossible to ignore.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button as={Link} to="/report" variant="accent" size="lg" icon={Camera}>
                Report an Issue
              </Button>
              <Button as={Link} to="/map" variant="outline" size="lg" icon={MapIcon}>
                Explore Public Map
              </Button>
            </div>

            <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {TRUST.map(({ icon: Icon, label }) => (
                <li key={label} className="flex flex-col items-center gap-2 text-sm text-white/85">
                  <Icon className="size-6 text-white" strokeWidth={1.8} />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
