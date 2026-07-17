import { Navigate, useLocation } from 'react-router-dom'
import { useCitizenAuthStore } from '@/store/citizenAuthStore'

/** Gate for citizen account pages. Redirects to /login, remembering intent. */
export function CitizenProtectedRoute({ children }) {
  const isAuthenticated = useCitizenAuthStore((s) => s.isAuthenticated)
  const location = useLocation()
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  return children
}
