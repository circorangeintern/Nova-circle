import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { OfficialLayout } from '@/components/official/OfficialLayout'
import { ProtectedRoute } from '@/components/official/ProtectedRoute'
import { CitizenProtectedRoute } from '@/components/auth/CitizenProtectedRoute'
import { PageLoader } from '@/components/common/PageLoader'
import Home from '@/pages/Home'

// Route-based code splitting (PRD §11): heavy pages (map/leaflet, charts, report
// flow) load on demand so the landing page stays fast. Home is eager.
const MapPage = lazy(() => import('@/pages/MapPage'))
const ReportIssue = lazy(() => import('@/pages/ReportIssue'))
const ReportDetail = lazy(() => import('@/pages/ReportDetail'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const About = lazy(() => import('@/pages/About'))
const NotFound = lazy(() => import('@/pages/NotFound'))

// Citizen accounts
const CitizenLogin = lazy(() => import('@/pages/citizen/CitizenLogin'))
const CitizenRegister = lazy(() => import('@/pages/citizen/CitizenRegister'))
const CitizenAccount = lazy(() => import('@/pages/citizen/CitizenAccount'))
const EditReport = lazy(() => import('@/pages/citizen/EditReport'))

// Official portal (auth-gated)
const OfficialLogin = lazy(() => import('@/pages/official/OfficialLogin'))
const OfficialDashboard = lazy(() => import('@/pages/official/OfficialDashboard'))
const OfficialReports = lazy(() => import('@/pages/official/OfficialReports'))
const OfficialReportDetail = lazy(() => import('@/pages/official/OfficialReportDetail'))

// Small helper to keep the route table readable.
const L = (el) => <Suspense fallback={<PageLoader />}>{el}</Suspense>

/**
 * Route table — mirrors PRD §9.2.
 * - Public routes use the marketing Layout (navbar + footer).
 * - The official login is standalone (its own split-screen layout).
 * - Official app routes are gated by ProtectedRoute and use OfficialLayout.
 */
export default function App() {
  return (
    <Routes>
      {/* Public site */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={L(<MapPage />)} />
        <Route path="/report" element={L(<ReportIssue />)} />
        <Route path="/reports/:id" element={L(<ReportDetail />)} />
        <Route path="/dashboard" element={L(<Dashboard />)} />
        <Route path="/about" element={L(<About />)} />

        {/* Citizen account (auth-gated) */}
        <Route
          path="/account"
          element={
            <CitizenProtectedRoute>{L(<CitizenAccount />)}</CitizenProtectedRoute>
          }
        />
        <Route
          path="/account/reports/:id/edit"
          element={
            <CitizenProtectedRoute>{L(<EditReport />)}</CitizenProtectedRoute>
          }
        />

        <Route path="*" element={L(<NotFound />)} />
      </Route>

      {/* Citizen auth (standalone split-screen) */}
      <Route path="/login" element={L(<CitizenLogin />)} />
      <Route path="/register" element={L(<CitizenRegister />)} />

      {/* Official login (standalone) */}
      <Route path="/official/login" element={L(<OfficialLogin />)} />

      {/* Official portal (auth-gated) */}
      <Route
        element={
          <ProtectedRoute>
            <OfficialLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/official/dashboard" element={L(<OfficialDashboard />)} />
        <Route path="/official/reports" element={L(<OfficialReports />)} />
        <Route path="/official/reports/:id" element={L(<OfficialReportDetail />)} />
      </Route>
    </Routes>
  )
}
