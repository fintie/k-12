import { useCallback, useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import News from './pages/News'
import Practice from './pages/Practice'
import ExamBuilder from './pages/ExamBuilder'
import QuestionBuilder from './pages/QuestionBuilder'
import StudyGroups from './pages/StudyGroups'
import Flashcards from './pages/Flashcards'
import Settings from './pages/Settings'
import HomePage from './pages/Homepage'
import NewTutors from './pages/NewTutors'
import StudentMeeting from './pages/StudentMeeting'
import TutorMeeting from './pages/TutorMeeting'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProtectedLayout from './components/auth/ProtectedLayout'
import { useAuth } from './context/AuthContext'
import { useTheme } from './context/ThemeContext'
import {
  computeDashboardProgressFromPractice,
  getPracticeStorageKey,
  readPracticeStateForUser,
} from './utils/practice-progress'
import './App.css'

const RedirectByRole = () => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Loading workspace...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/home" replace />
  }

  return <Navigate to="/news" replace />
}

function App() {
  const { user: authUser } = useAuth()
  const { theme } = useTheme()
  const [profile, setProfile] = useState({
    name: 'Alex Johnson',
    firstName: 'Alex',
    lastName: 'Johnson',
    email: '',
    school: '',
    grade: '8th Grade',
    preferences: {
      difficulty: 'moderate',
      subject: 'Algebra'
    },
    avatar: '/api/placeholder/40/40',
    progress: {
      overall: 75,
      subjects: {
        algebra: 82,
        geometry: 68,
        statistics: 79,
        calculus: 45,
      },
    },
  })

  const syncPracticeProgress = useCallback((userId) => {
    if (!userId) return
    setProfile((prev) => ({
      ...prev,
      progress: computeDashboardProgressFromPractice(
        readPracticeStateForUser(userId),
        prev.progress
      ),
    }))
  }, [])

  useEffect(() => {
    if (!authUser) return
    const fullName = [authUser.firstName, authUser.lastName].filter(Boolean).join(' ')
    setProfile((prev) => ({
      ...prev,
      name: fullName || authUser.displayName || authUser.username || prev.name,
      firstName: authUser.firstName || prev.firstName,
      lastName: authUser.lastName || prev.lastName,
      email: authUser.email || prev.email,
      school: authUser.school || prev.school,
      grade: authUser.grade || prev.grade,
      preferences: {
        ...(prev.preferences || {}),
        difficulty: authUser.preferredDifficulty || prev.preferences?.difficulty || 'moderate',
        subject: authUser.preferredSubject || prev.preferences?.subject || 'Algebra'
      }
    }))
  }, [authUser])

  useEffect(() => {
    if (!authUser?.id) return
    syncPracticeProgress(authUser.id)
  }, [authUser?.id, syncPracticeProgress])

  useEffect(() => {
    if (!authUser?.id) return

    const activeUserId = String(authUser.id)
    const expectedStorageKey = getPracticeStorageKey(activeUserId)

    const handlePracticeProgressUpdated = (event) => {
      const eventUserId = String(event?.detail?.userId || '')
      if (eventUserId && eventUserId !== activeUserId) return
      syncPracticeProgress(activeUserId)
    }

    const handleStorage = (event) => {
      if (event.key !== expectedStorageKey) return
      syncPracticeProgress(activeUserId)
    }

    window.addEventListener('practice-progress-updated', handlePracticeProgressUpdated)
    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('practice-progress-updated', handlePracticeProgressUpdated)
      window.removeEventListener('storage', handleStorage)
    }
  }, [authUser?.id, syncPracticeProgress])

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedLayout profile={profile} />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/new-tutors" element={<NewTutors />} />
          <Route path="/news" element={<News />} />
          <Route path="/dashboard" element={<Dashboard user={profile} />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/exam-builder" element={<ExamBuilder />} />
          <Route path="/question-builder" element={<QuestionBuilder />} />
          <Route path="/study-groups" element={<StudyGroups />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/student-meetings" element={<StudentMeeting />} />
          <Route path="/tutor-meetings" element={<TutorMeeting />} />
          <Route path="/settings" element={<Settings user={profile} setUser={setProfile} />} />
        </Route>
        <Route path="/" element={<RedirectByRole />} />
        <Route path="*" element={<RedirectByRole />} />
      </Routes>
    </Router>
  )
}

export default App
