import { Outlet } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import { useAuth } from '@/context/AuthContext'

const ProtectedLayout = ({ profile }) => {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Loading workspace...
      </div>
    )
  }

  return (
    <Layout profile={profile}>
      <Outlet />
    </Layout>
  )
}

export default ProtectedLayout
