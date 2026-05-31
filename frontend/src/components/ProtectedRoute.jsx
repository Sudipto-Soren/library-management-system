import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function ProtectedRoute() {
  const { token, loading } = useAuth()

  if (loading) {
    return (
      <div className="bg-mesh flex items-center justify-center min-h-screen">
        <div className="glass p-8 flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 text-sm font-medium">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
