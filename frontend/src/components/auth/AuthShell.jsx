import { Link } from 'react-router-dom'
import { Camera, MapPin, LineChart } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'
import { TopoPattern } from '@/components/home/TopoPattern'

const HIGHLIGHTS = [
  { icon: Camera, text: 'Report issues in under 90 seconds' },
  { icon: MapPin, text: 'Track every report on the public map' },
  { icon: LineChart, text: 'See officials respond in the open' },
]

/**
 * AuthShell — reusable split-screen frame for citizen auth pages. Left is a
 * civic brand panel; right hosts the form. Mobile stacks to just the form.
 */
export function AuthShell({ children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-navy-900 via-civic-600 to-civic-500 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <TopoPattern className="pointer-events-none absolute inset-0 h-full w-full" />
        <Link to="/" className="relative">
          <Logo />
        </Link>
        <div className="relative">
          <img src="/publiceye-logo.png" alt="" width="40" height="40" className="size-10 rounded-full bg-white object-cover" />
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight">
            Your voice matters — even before you have an account.
          </h1>
          <p className="mt-3 max-w-md text-white/80">
            Create a free account to keep track of every issue you report and follow its progress
            through to resolution.
          </p>
          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-white/90">
                <span className="grid size-8 place-items-center rounded-lg bg-white/15">
                  <Icon className="size-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-white/60">Reporting is always free and never requires an account.</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-surface p-6 sm:p-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
