import { Navigate, useLocation } from 'react-router-dom'
import { useToast } from '../hooks/useToast'

interface ProtectedRouteProps {
  children: React.ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation()
  const { success: showError } = useToast()

  const isAuthenticated = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      showError('Please log in to access this page')
      return false
    }
    return true
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
