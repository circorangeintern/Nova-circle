import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { PageLoader } from '@/components/common/PageLoader'
import Home from '@/pages/Home'

// Route-based code splitting (PRD §11): heavy pages (map/leaflet, charts) load
// on demand so the landing page stays fast. Home is eager for instant first paint.
const MapPage = lazy(() => import('@/pages/MapPage'))
const ReportIssue = lazy(() => import('@/pages/ReportIssue'))
const ReportDetail = lazy(() => import('@/pages/ReportDetail'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const About = lazy(() => import('@/pages/About'))
const OfficialLogin = lazy(() => import('@/pages/OfficialLogin'))
const NotFound = lazy(() => import('@/pages/NotFound'))

/**
 * Route table — mirrors the PRD §9.2 structure, nested under a shared Layout.
 * Official portal routes are stubbed until the backend auth contract lands.
 */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route
          path="/map"
          element={
            <Suspense fallback={<PageLoader />}>
              <MapPage />
            </Suspense>
          }
        />
        <Route
          path="/report"
          element={
            <Suspense fallback={<PageLoader />}>
              <ReportIssue />
            </Suspense>
          }
        />
        <Route
          path="/reports/:id"
          element={
            <Suspense fallback={<PageLoader />}>
              <ReportDetail />
            </Suspense>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<PageLoader />}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route
          path="/about"
          element={
            <Suspense fallback={<PageLoader />}>
              <About />
            </Suspense>
          }
        />
        <Route
          path="/official/login"
          element={
            <Suspense fallback={<PageLoader />}>
              <OfficialLogin />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <Suspense fallback={<PageLoader />}>
              <NotFound />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  )
}
