import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const RequireRole = ({ role, children }) => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Loading workspace...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== role) {
    const target = user.role === 'student' ? '/student-meetings' : '/tutor-meetings'
    return <Navigate to={target} replace />
  }

  return children
}

export default RequireRole
