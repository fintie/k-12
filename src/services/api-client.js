const trimTrailingSlash = (value) => value.replace(/\/+$/, '')

export const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
)

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  })

  const text = await response.text()
  let data = {}

  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      throw new Error('Unable to parse server response')
    }
  }

  if (!response.ok) {
    const detail = data?.detail
    const message = Array.isArray(detail)
      ? detail.map((item) => item.msg).join('; ')
      : detail || data?.error || 'Request failed'
    throw new Error(message)
  }

  return data
}