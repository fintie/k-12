const DEFAULT_BACKEND_URL = 'http://127.0.0.1:8000/api'

export const BACKEND_API_URL =
  import.meta.env.VITE_BACKEND_API_URL?.replace(/\/$/, '') || DEFAULT_BACKEND_URL

const TOKEN_KEY = 'nextgenius-auth-token'

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export async function apiRequest(path, options = {}) {
  const token = getAuthToken()

  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const response = await fetch(`${BACKEND_API_URL}${path}`, {
    ...options,
    headers,
  })

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new Error(data?.detail || data?.error || 'Request failed')
  }

  return data
}