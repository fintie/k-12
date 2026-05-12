import { API_BASE_URL } from './api-client'

export async function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}/uploads/images`, {
    method: 'POST',
    body: formData,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data?.detail || 'Image upload failed')
  }

  return data
}