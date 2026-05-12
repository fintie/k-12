import { apiRequest } from './backend-api'

export async function fetchQuestions(filters = {}) {
  const params = new URLSearchParams()

  if (filters.subject) params.set('subject', filters.subject)
  if (filters.difficulty) params.set('difficulty', filters.difficulty)
  if (filters.type) params.set('type', filters.type)

  const query = params.toString()
  return apiRequest(`/questions${query ? `?${query}` : ''}`)
}

export async function createQuestion(payload) {
  return apiRequest('/questions', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateQuestion(questionId, payload) {
  return apiRequest(`/questions/${questionId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function deleteQuestion(questionId) {
  return apiRequest(`/questions/${questionId}`, {
    method: 'DELETE',
  })
}

export async function checkQuestionAnswer(questionId, payload) {
  return apiRequest(`/questions/${questionId}/check-answer`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function uploadQuestionImage(file) {
  const formData = new FormData()
  formData.append('file', file)

  return apiRequest('/uploads/images', {
    method: 'POST',
    body: formData,
  })
}