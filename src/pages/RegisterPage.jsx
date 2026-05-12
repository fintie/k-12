import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const YEAR_LEVELS = [
  'Year 3',
  'Year 4',
  'Year 5',
  'Year 6',
  'Year 7',
  'Year 8',
  'Year 9',
  'Year 10',
  'Year 11',
  'Year 12',
]

const NSW_MATH_SUBJECTS = [
  'Selective / OC Mathematics',
  'NAPLAN Mathematics',
  'NSW Stage 4 Mathematics',
  'NSW Stage 5 Mathematics',
  'HSC Mathematics Standard',
  'HSC Mathematics Advanced',
  'HSC Mathematics Extension 1',
  'HSC Mathematics Extension 2',
]

const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Foundation' },
  { value: 'moderate', label: 'Core' },
  { value: 'advanced', label: 'Extension' },
]

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

    // Student fields
    school: '',
    grade: 'Year 12',
    preferredDifficulty: 'moderate',
    preferredSubject: 'HSC Mathematics Advanced',

    // Tutor-facing fields, mapped to existing backend fields for MVP
    organisation: '',
    teachingYearLevels: 'Year 7–12',
    teachingSubject: 'HSC Mathematics Advanced',
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

  const validateStudentProfile = () => {
    const school = form.school.trim()
    const yearLevel = form.grade.trim()
    const preferredDifficulty = form.preferredDifficulty.trim()
    const preferredSubject = form.preferredSubject.trim()

    if (!school || !yearLevel || !preferredDifficulty || !preferredSubject) {
      setLocalError('Please complete school, year level, difficulty, and subject preferences')
      return false
    }

    return true
  }

  const validateTutorProfile = () => {
    const organisation = form.organisation.trim()
    const teachingYearLevels = form.teachingYearLevels.trim()
    const teachingSubject = form.teachingSubject.trim()

    if (!organisation || !teachingYearLevels || !teachingSubject) {
      setLocalError('Please complete organisation, teaching year levels, and teaching subject')
      return false
    }

    return true
  }

  const validateStepTwo = () => {
    return role === 'student' ? validateStudentProfile() : validateTutorProfile()
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

    if (!validateStepOne() || !validateStepTwo()) {
      setSubmitting(false)
      return
    }

    const username = form.username.trim()
    const password = form.password.trim()
    const firstName = form.firstName.trim()
    const lastName = form.lastName.trim()
    const email = form.email.trim()

    const profilePayload =
      role === 'student'
        ? {
            school: form.school.trim(),
            grade: form.grade.trim(),
            preferredDifficulty: form.preferredDifficulty.trim(),
            preferredSubject: form.preferredSubject.trim(),
          }
        : {
            // MVP mapping:
            // organisation -> school
            // teachingYearLevels -> grade/year_level
            // teachingSubject -> preferred_subject
            school: form.organisation.trim(),
            grade: form.teachingYearLevels.trim(),
            preferredDifficulty: 'moderate',
            preferredSubject: form.teachingSubject.trim(),
          }

    try {
      await register({
        username,
        password,
        role,
        firstName,
        lastName,
        email,
        ...profilePayload,
      })

      navigate('/login', { replace: true })
    } catch (authError) {
      setLocalError(authError.message)
    } finally {
      setSubmitting(false)
    }
  }

  const helperText = useMemo(() => {
    if (step === 1) {
      return role === 'student'
        ? 'Create a student account to access personalised practice and progress tracking.'
        : 'Create a tutor account to create questions and support students.'
    }

    return role === 'student'
      ? 'Step 2: finish your learning profile to personalise practice.'
      : 'Step 2: finish your tutor profile.'
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

          {step === 2 && role === 'student' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="school">School</Label>
                <Input
                  id="school"
                  value={form.school}
                  onChange={handleChange('school')}
                  placeholder="e.g. The King's School"
                  autoComplete="organization"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="grade">Year Level</Label>
                  <select
                    id="grade"
                    value={form.grade}
                    onChange={handleChange('grade')}
                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  >
                    {YEAR_LEVELS.map((yearLevel) => (
                      <option key={yearLevel} value={yearLevel}>
                        {yearLevel}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="preferredDifficulty">Preferred Difficulty</Label>
                  <select
                    id="preferredDifficulty"
                    value={form.preferredDifficulty}
                    onChange={handleChange('preferredDifficulty')}
                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  >
                    {DIFFICULTY_LEVELS.map((difficulty) => (
                      <option key={difficulty.value} value={difficulty.value}>
                        {difficulty.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="preferredSubject">Preferred Subject</Label>
                <select
                  id="preferredSubject"
                  value={form.preferredSubject}
                  onChange={handleChange('preferredSubject')}
                  className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  {NSW_MATH_SUBJECTS.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 2 && role === 'tutor' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="organisation">Organisation / School / University</Label>
                <Input
                  id="organisation"
                  value={form.organisation}
                  onChange={handleChange('organisation')}
                  placeholder="e.g. NextGenius, USYD, private tutor"
                  autoComplete="organization"
                />
              </div>

              <div>
                <Label htmlFor="teachingYearLevels">Teaching Year Levels</Label>
                <Input
                  id="teachingYearLevels"
                  value={form.teachingYearLevels}
                  onChange={handleChange('teachingYearLevels')}
                  placeholder="e.g. Year 7–12, HSC"
                />
              </div>

              <div>
                <Label htmlFor="teachingSubject">Teaching Subject</Label>
                <select
                  id="teachingSubject"
                  value={form.teachingSubject}
                  onChange={handleChange('teachingSubject')}
                  className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  {NSW_MATH_SUBJECTS.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
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
              <Button
                type="button"
                variant="outline"
                className="w-1/3"
                onClick={() => setStep(1)}
                disabled={submitting}
              >
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