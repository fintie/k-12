import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Practice from './pages/Practice'
import ExamBuilder from './pages/ExamBuilder'
import QuestionBuilder from './pages/QuestionBuilder'
import StudyGroups from './pages/StudyGroups'
import Flashcards from './pages/Flashcards'
import Settings from './pages/Settings'
import HomePage from './pages/Homepage'
import './App.css'

function App() {
  const [user, setUser] = useState({
    name: 'Alex Johnson',
    grade: '8th Grade',
    avatar: '/api/placeholder/40/40',
    progress: {
      overall: 75,
      subjects: {
        algebra: 82,
        geometry: 68,
        statistics: 79,
        calculus: 45
      }
    }
  })

  return (
    <Router basename="/k-12">
      <div className="min-h-screen bg-slate-50">
        <Layout user={user}>
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/exam-builder" element={<ExamBuilder />} />
            <Route path="/question-builder" element={<QuestionBuilder />} />
            <Route path="/study-groups" element={<StudyGroups />} />
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/settings" element={<Settings user={user} setUser={setUser} />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  )
}

export default App

