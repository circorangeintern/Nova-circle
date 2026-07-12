import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, Plus, Menu, X, LogIn, User } from 'lucide-react'
import { Logo } from './Logo'
import { AccountMenu } from './AccountMenu'
import { Button } from '@/components/ui/Button'
import { useCitizenAuthStore } from '@/store/citizenAuthStore'
import { cn } from '@/lib/cn'

const NAV_LINKS = [
  { to: '/map', label: 'Map' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/about', label: 'About' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const { isAuthenticated, user, logout } = useCitizenAuthStore()

  return (
    <header className="sticky top-0 z-50 bg-navy-900 text-white shadow-e2">
      <nav className="container-page flex h-[68px] items-center gap-4" aria-label="Primary">
        <Link to="/" className="shrink-0 rounded-lg" aria-label="PublicEye NG home">
          <Logo />
        </Link>

        {/* Desktop links */}
        <div className="ml-2 hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2 text-[15px] font-medium text-white/85 transition-colors hover:text-white',
                  isActive && 'text-white',
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Search (desktop) */}
        <form
          className="ml-auto hidden max-w-xs flex-1 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-white/70 transition-colors focus-within:border-white/40 md:flex"
          role="search"
          onSubmit={(e) => e.preventDefault()}
        >
          <Search className="size-4 shrink-0" />
          <input
            type="search"
            placeholder="Search reports..."
            className="w-full bg-transparent text-sm text-white placeholder:text-white/60 focus:outline-none"
            aria-label="Search reports"
          />
        </form>

        {/* Right actions (desktop) */}
        <div className="ml-auto hidden items-center gap-2 md:ml-0 lg:flex">
          <Link
            to="/official/login"
            className="rounded-lg px-3 py-2 text-[15px] font-medium text-white/85 transition-colors hover:text-white"
          >
            Official Login
          </Link>
          <AccountMenu />
          <Button as={Link} to="/report" icon={Plus} className="bg-civic-500 hover:bg-civic-600">
            Report Issue
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="ml-auto grid size-10 place-items-center rounded-lg text-white lg:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden border-t border-white/10 lg:hidden"
          >
            <div className="container-page flex flex-col gap-1 py-4">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'rounded-lg px-3 py-3 text-base font-medium text-white/85 hover:bg-white/10',
                    pathname === l.to && 'bg-white/10 text-white',
                  )}
                >
                  {l.label}
                </Link>
              ))}
              <div className="my-1 h-px bg-white/10" />
              {isAuthenticated ? (
                <>
                  <Link
                    to="/account"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-3 text-base font-medium text-white/85 hover:bg-white/10"
                  >
                    <User className="size-4" /> My Account
                  </Link>
                  <button
                    onClick={() => {
                      logout()
                      setOpen(false)
                    }}
                    className="flex items-center gap-2 rounded-lg px-3 py-3 text-left text-base font-medium text-white/85 hover:bg-white/10"
                  >
                    <LogIn className="size-4 rotate-180" /> Log out{user ? ` (${user.name.split(' ')[0]})` : ''}
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-3 text-base font-medium text-white/85 hover:bg-white/10"
                >
                  <User className="size-4" /> Sign in
                </Link>
              )}
              <Link
                to="/official/login"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-3 text-base font-medium text-white/85 hover:bg-white/10"
              >
                <LogIn className="size-4" /> Official Login
              </Link>
              <Button
                as={Link}
                to="/report"
                onClick={() => setOpen(false)}
                icon={Plus}
                fullWidth
                size="lg"
                className="mt-2 bg-civic-500 hover:bg-civic-600"
              >
                Report Issue
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
