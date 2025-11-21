import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, login, error, clearError } = useAuth()
  const [role, setRole] = useState('student')
  const [form, setForm] = useState({ username: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState('')
  const redirectTo = location.state?.from && location.state.from !== '/login' ? location.state.from : '/news'

  useEffect(() => {
    if (user) {
      navigate(redirectTo, { replace: true })
    }
  }, [user, navigate, redirectTo])

  useEffect(() => {
    clearError()
    setLocalError('')
  }, [role, clearError])

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setLocalError('')
    clearError()

    const username = form.username.trim()
    const password = form.password.trim()

    if (!username || !password) {
      setLocalError('Username and password are required')
      setSubmitting(false)
      return
    }

    try {
      await login({ username, password, role })
    } catch (authError) {
      setLocalError(authError.message)
    } finally {
      setSubmitting(false)
    }
  }

  const effectiveError = localError || error

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">NextGenius Login</h1>
          <p className="mt-2 text-sm text-slate-500">Choose a role and sign in with your registered account.</p>
        </div>

        <div className="mb-6 flex gap-2">
          <Button
            type="button"
            variant={role === 'student' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setRole('student')}
          >
            Student
          </Button>
          <Button
            type="button"
            variant={role === 'tutor' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setRole('tutor')}
          >
            Tutor
          </Button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={form.username}
              onChange={handleChange('username')}
              placeholder="Enter your username"
              autoComplete="username"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={handleChange('password')}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          {effectiveError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {effectiveError}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-4 text-center text-xs text-slate-500">
          Need an account?
          <Link to="/register" className="ml-1 text-indigo-500 hover:text-indigo-600">
            Register here
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
