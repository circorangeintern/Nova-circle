import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

/**
 * ProtectedRoute — gate for the official portal. Unauthenticated users are sent
 * to the official login, preserving their intended destination.
 * (Backend: this is UI convenience only — the API must enforce RBAC too.)
 */
export function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = useLocation()
  if (!isAuthenticated) {
    return <Navigate to="/official/login" state={{ from: location.pathname }} replace />
  }
  return children
}
