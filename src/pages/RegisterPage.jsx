import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const RegisterPage = () => {
  const navigate = useNavigate()
  const { user, register, error, clearError } = useAuth()
  const [role, setRole] = useState('student')
  const [form, setForm] = useState({
    username: '',
    password: '',
    displayName: '',
    grade: '',
    subject: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    if (user) {
      navigate('/news', { replace: true })
    }
  }, [user, navigate])

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
    const displayName = form.displayName.trim() || username
    const grade = form.grade.trim()
    const subject = form.subject.trim()

    if (!username || !password) {
      setLocalError('Username and password are required')
      setSubmitting(false)
      return
    }

    try {
      await register({
        username,
        password,
        role,
        displayName,
        grade: role === 'student' ? grade : undefined,
        subject: role === 'tutor' ? subject : undefined
      })
      navigate('/login', { replace: true })
    } catch (authError) {
      setLocalError(authError.message)
    } finally {
      setSubmitting(false)
    }
  }

  const helperText = useMemo(() => {
    return role === 'student'
      ? 'Create a student account to access the Student Meetings page.'
      : 'Create a tutor account to access the Tutor Meetings page.'
  }, [role])

  const effectiveError = localError || error

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">NextGenius Sign Up</h1>
          <p className="mt-2 text-sm text-slate-500">{helperText}</p>
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
              placeholder="Enter a username"
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
              placeholder="Enter a password"
              autoComplete="new-password"
            />
          </div>

          <div>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={form.displayName}
              onChange={handleChange('displayName')}
              placeholder="e.g. Alex Johnson"
            />
          </div>

          {role === 'student' && (
            <div>
              <Label htmlFor="grade">Grade (optional)</Label>
              <Input
                id="grade"
                value={form.grade}
                onChange={handleChange('grade')}
                placeholder="e.g. Grade 8"
              />
            </div>
          )}

          {role === 'tutor' && (
            <div>
              <Label htmlFor="subject">Subject Focus (optional)</Label>
              <Input
                id="subject"
                value={form.subject}
                onChange={handleChange('subject')}
                placeholder="e.g. Algebra II"
              />
            </div>
          )}

          {effectiveError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {effectiveError}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Sign up'}
          </Button>
        </form>

        <div className="mt-4 text-center text-xs text-slate-500">
          Already registered?
          <Link to="/login" className="ml-1 text-indigo-500 hover:text-indigo-600">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
