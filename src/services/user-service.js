import { getChatServerBaseUrl } from '@/services/chat-service'

const BASE_URL = getChatServerBaseUrl()

const parseJson = async (response) => {
  const text = await response.text()
  if (!text) {
    return {}
  }
  try {
    return JSON.parse(text)
  } catch (error) {
    throw new Error('Unable to parse server response')
  }
}

export const fetchUsers = async ({ role } = {}) => {
  const query = role ? `?role=${encodeURIComponent(role)}` : ''
  const response = await fetch(`${BASE_URL}/users${query}`)
  const data = await parseJson(response)

  if (!response.ok) {
    throw new Error(data?.error || 'Failed to fetch users')
  }

  return Array.isArray(data.users) ? data.users : []
}

export const fetchUserById = async (userId) => {
  if (!userId) {
    throw new Error('userId is required')
  }

  const response = await fetch(`${BASE_URL}/users/${encodeURIComponent(userId)}`)
  const data = await parseJson(response)

  if (!response.ok) {
    throw new Error(data?.error || 'Failed to fetch user')
  }

  return data.user
}
