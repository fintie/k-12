import { apiRequest } from './backend-api'

export async function createMyPracticeSession(payload) {
  return apiRequest('/practice/sessions/me', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function submitPracticeAnswer(sessionId, payload) {
  return apiRequest(`/practice/sessions/${sessionId}/answers`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function finishPracticeSession(sessionId) {
  return apiRequest(`/practice/sessions/${sessionId}/finish`, {
    method: 'POST',
  })
}

export async function fetchPracticeSession(sessionId) {
  return apiRequest(`/practice/sessions/${sessionId}`)
}

export async function fetchStudentProgress(studentId) {
  const params = new URLSearchParams({ student_id: studentId })
  return apiRequest(`/practice/progress?${params.toString()}`)
}