import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { User, LayoutDashboard, FileText, LogOut, ChevronDown } from 'lucide-react'
import { useCitizenAuthStore } from '@/store/citizenAuthStore'

/**
 * AccountMenu — citizen auth control in the navbar. Shows "Sign in" when logged
 * out; an avatar dropdown (Account, My Reports, Log out) when logged in.
 */
export function AccountMenu() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useCitizenAuthStore()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  if (!isAuthenticated) {
    return (
      <Link
        to="/login"
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[15px] font-medium text-white/85 transition-colors hover:text-white"
      >
        <User className="size-4" /> Sign in
      </Link>
    )
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const doLogout = () => {
    logout()
    setOpen(false)
    navigate('/')
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full py-1 pl-1 pr-2 text-white transition-colors hover:bg-white/10"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="grid size-8 place-items-center rounded-full bg-white/15 text-sm font-bold">{initials}</span>
        <ChevronDown className="size-4 text-white/70" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-card border border-line bg-white py-1 shadow-e3"
            role="menu"
          >
            <div className="border-b border-line px-4 py-3">
              <p className="truncate font-semibold text-ink">{user.name}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
            <MenuLink to="/account" icon={LayoutDashboard} onClick={() => setOpen(false)}>
              My Account
            </MenuLink>
            <MenuLink to="/account" icon={FileText} onClick={() => setOpen(false)}>
              My Reports
            </MenuLink>
            <button
              onClick={doLogout}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-critical hover:bg-critical/[0.06]"
              role="menuitem"
            >
              <LogOut className="size-4" /> Log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MenuLink({ to, icon: Icon, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate hover:bg-surface hover:text-ink"
      role="menuitem"
    >
      <Icon className="size-4 text-muted" /> {children}
    </Link>
  )
}
