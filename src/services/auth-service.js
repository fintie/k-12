import { getChatServerBaseUrl } from '@/services/chat-service'

const BASE_URL = getChatServerBaseUrl()

const request = async (path, options) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    ...options
  })

  const text = await response.text()
  let data = {}

  if (text) {
    try {
      data = JSON.parse(text)
    } catch (error) {
      throw new Error('Unable to parse server response')
    }
  }

  if (!response.ok) {
    const message = data?.error || 'Request failed'
    throw new Error(message)
  }

  return data
}

export const registerUser = async ({ username, password, role, displayName, grade, subject }) => {
  return request('/users/register', {
    method: 'POST',
    body: JSON.stringify({ username, password, role, displayName, grade, subject })
  })
}

export const loginUser = async ({ username, password, role }) => {
  return request('/users/login', {
    method: 'POST',
    body: JSON.stringify({ username, password, role })
  })
}
