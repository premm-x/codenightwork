import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function AuthLayout() {
  const { currentUser } = useAuth()
  
  // Redirect if user is already logged in
  if (currentUser) {
    return <Navigate to="/" replace />
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-600 p-4">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout