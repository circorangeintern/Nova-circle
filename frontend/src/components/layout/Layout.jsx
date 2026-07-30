import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

/** Scrolls to top on route change (except when navigating within a hash). */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }, [pathname])
  return null
}

/**
 * Layout — persistent shell around every routed page. The map page renders its
 * own full-height canvas, so we drop the footer there for an app-like feel.
 */
export function Layout() {
  const { pathname } = useLocation()
  const isMap = pathname === '/map'

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {!isMap && <Footer />}
    </div>
  )
}
