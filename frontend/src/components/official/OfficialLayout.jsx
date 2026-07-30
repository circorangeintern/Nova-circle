import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import { LayoutDashboard, ListChecks, LogOut, ShieldCheck } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/cn'

const NAV = [
  { to: '/official/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/official/reports', label: 'Reports', icon: ListChecks },
]

/**
 * OfficialLayout — shell for the government portal: top bar with the official's
 * identity + verification badge, and section nav. Feels like an operational
 * console (Master PRD §3.6), distinct from the public site.
 */
export function OfficialLayout() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/official/login')
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-40 border-b border-line bg-white">
        <div className="container-page flex h-16 items-center gap-4">
          <Link to="/official/dashboard" className="flex items-center gap-2">
            <Logo onDark={false} />
          </Link>
          <span className="hidden items-center gap-1 rounded-full bg-civic/10 px-2.5 py-1 text-xs font-semibold text-civic-600 sm:inline-flex">
            <ShieldCheck className="size-3.5" /> Official Portal
          </span>

          <nav className="ml-4 hidden items-center gap-1 md:flex">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive ? 'bg-civic/10 text-civic-600' : 'text-slate hover:bg-slate/[0.05]',
                  )
                }
              >
                <Icon className="size-4" /> {label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {user && (
              <div className="hidden text-right sm:block">
                <div className="text-sm font-semibold text-ink">{user.name}</div>
                <div className="text-xs text-muted">
                  {user.role} · {user.lga}, {user.state}
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm font-medium text-slate hover:border-critical/40 hover:text-critical"
            >
              <LogOut className="size-4" /> <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="container-page flex gap-1 border-t border-line py-2 md:hidden">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium',
                  isActive ? 'bg-civic/10 text-civic-600' : 'text-slate',
                )
              }
            >
              <Icon className="size-4" /> {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="container-page py-6">
        <Outlet />
      </main>
    </div>
  )
}
