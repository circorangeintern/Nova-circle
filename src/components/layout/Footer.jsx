import { Link } from 'react-router-dom'
import { Logo } from './Logo'

const COLUMNS = [
  {
    title: 'Platform',
    links: [
      { label: 'Public Map', to: '/map' },
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Report an Issue', to: '/report' },
      { label: 'About', to: '/about' },
    ],
  },
  {
    title: 'For Officials',
    links: [
      { label: 'Official Login', to: '/official/login' },
      { label: 'How Verification Works', to: '/about' },
      { label: 'Accountability Data', to: '/dashboard' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Help Center', to: '/about' },
      { label: 'Open Data', to: '/dashboard' },
      { label: 'Privacy', to: '/about' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-navy-950 text-white/80">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            A transparent public record of Nigeria's infrastructure — making failures impossible to
            deny, impossible to hide, and politically costly to ignore.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="font-sans text-sm font-semibold uppercase tracking-wide text-white/50">
              {col.title}
            </h4>
            <ul className="mt-4 space-y-3 text-sm">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-white/70 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-sm text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} PublicEye NG · Circo Digital Academy — Orange Internship</p>
          <p className="font-data text-xs">Civic accountability, made visible.</p>
        </div>
      </div>
    </footer>
  )
}
