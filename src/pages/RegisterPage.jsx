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
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    school: '',
    grade: '',
    preferredDifficulty: 'moderate',
    preferredSubject: ''
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
    setStep(1)
  }, [role, clearError])

  useEffect(() => {
    clearError()
    setLocalError('')
  }, [step, clearError])

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const validateStepOne = () => {
    const username = form.username.trim()
    const password = form.password.trim()
    const firstName = form.firstName.trim()
    const lastName = form.lastName.trim()
    const email = form.email.trim()

    if (!username || !password) {
      setLocalError('Username and password are required')
      return false
    }
    if (!firstName || !lastName || !email) {
      setLocalError('First name, last name, and email are required')
      return false
    }
    return true
  }

  const validateStepTwo = () => {
    const school = form.school.trim()
    const grade = form.grade.trim()
    const preferredDifficulty = form.preferredDifficulty.trim()
    const preferredSubject = form.preferredSubject.trim()

    if (!school || !grade || !preferredDifficulty || !preferredSubject) {
      setLocalError('Please complete school, grade, difficulty, and subject preferences')
      return false
    }
    return true
  }

  const handleNextStep = (event) => {
    event?.preventDefault()
    setLocalError('')
    clearError()
    if (validateStepOne()) {
      setStep(2)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (step === 1) {
      handleNextStep()
      return
    }
    setSubmitting(true)
    setLocalError('')
    clearError()

    const username = form.username.trim()
    const password = form.password.trim()
    const firstName = form.firstName.trim()
    const lastName = form.lastName.trim()
    const email = form.email.trim()
    const school = form.school.trim()
    const grade = form.grade.trim()
    const preferredDifficulty = form.preferredDifficulty.trim()
    const preferredSubject = form.preferredSubject.trim()

    if (!validateStepOne() || !validateStepTwo()) {
      setSubmitting(false)
      return
    }

    try {
      await register({
        username,
        password,
        role,
        firstName,
        lastName,
        email,
        school,
        grade,
        preferredDifficulty,
        preferredSubject
      })
      navigate('/login', { replace: true })
    } catch (authError) {
      setLocalError(authError.message)
    } finally {
      setSubmitting(false)
    }
  }

  const helperText = useMemo(() => {
    const base =
      role === 'student'
        ? 'Create a student account to access the Student Meetings page.'
        : 'Create a tutor account to access the Tutor Meetings page.'
    return step === 1
      ? `${base} Step 1: account basics.`
      : 'Step 2: finish your learning profile to personalize practice.'
  }, [role, step])

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
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Step {step} of 2</span>
            {step === 2 && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setStep(1)}>
                Back
              </Button>
            )}
          </div>

          {step === 1 && (
            <div className="space-y-4">
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={form.firstName}
                    onChange={handleChange('firstName')}
                    placeholder="e.g. Alex"
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={form.lastName}
                    onChange={handleChange('lastName')}
                    placeholder="e.g. Johnson"
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="school">School</Label>
                <Input
                  id="school"
                  value={form.school}
                  onChange={handleChange('school')}
                  placeholder="Enter your school name"
                  autoComplete="organization"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="grade">Grade</Label>
                  <Input
                    id="grade"
                    value={form.grade}
                    onChange={handleChange('grade')}
                    placeholder="e.g. Grade 8"
                  />
                </div>
                <div>
                  <Label htmlFor="preferredDifficulty">Practice Difficulty</Label>
                  <select
                    id="preferredDifficulty"
                    value={form.preferredDifficulty}
                    onChange={handleChange('preferredDifficulty')}
                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  >
                    <option value="easy">Easy</option>
                    <option value="moderate">Moderate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="preferredSubject">Favorite Subject to Practice</Label>
                <Input
                  id="preferredSubject"
                  value={form.preferredSubject}
                  onChange={handleChange('preferredSubject')}
                  placeholder="e.g. Algebra, Geometry"
                />
              </div>
            </div>
          )}

          {effectiveError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {effectiveError}
            </div>
          )}

          {step === 1 ? (
            <Button type="button" className="w-full" onClick={handleNextStep}>
              Continue to profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="w-1/3" onClick={() => setStep(1)} disabled={submitting}>
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? 'Creating account...' : 'Create account'}
              </Button>
            </div>
          )}
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
