import { Link } from 'react-router-dom'
import { Camera, Map as MapIcon, ShieldCheck, Users, Globe } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TopoPattern } from './TopoPattern'
import { LivePlatformStats } from './LivePlatformStats'

const TRUST = [
  { icon: ShieldCheck, label: 'Transparent Records' },
  { icon: Users, label: 'Community Verified' },
  { icon: Globe, label: 'Open Data' },
]

export function HeroSection({ stats }) {
  return (
    <section className="container-page pt-6 sm:pt-8">
      <div className="relative overflow-hidden rounded-panel bg-gradient-to-br from-navy-900 via-civic-600 to-civic-500 px-6 py-12 shadow-e2 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
        <TopoPattern className="pointer-events-none absolute inset-0 h-full w-full" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 size-96 rounded-full bg-white/10 blur-3xl" />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm"><span className="size-2 rounded-full bg-success" />Nigeria's Civic Infrastructure Platform</span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.06] text-white sm:text-5xl lg:text-[3.4rem]">Nigeria's Infrastructure,<br /><span className="text-accent">Made Impossible</span><br />to Ignore.</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">Document broken public infrastructure, help your community, and hold public institutions accountable through transparent reporting.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Button as={Link} to="/report" variant="accent" size="lg" icon={Camera}>Report an Issue</Button><Button as={Link} to="/map" variant="outline" size="lg" icon={MapIcon}>Explore Public Map</Button></div>
            <ul className="mt-9 flex flex-wrap gap-x-7 gap-y-3">{TRUST.map(({ icon: Icon, label }) => <li key={label} className="flex items-center gap-2 text-sm font-medium text-white/85"><Icon className="size-4 text-success" strokeWidth={2.2} />{label}</li>)}</ul>
          </div>
          <div className="w-full lg:justify-self-end lg:pl-6"><LivePlatformStats stats={stats} /></div>
        </div>
      </div>
    </section>
  )
}
