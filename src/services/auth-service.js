import { apiRequest, setAuthToken } from './backend-api'

function mapBackendUser(user) {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    school: user.school,
    grade: user.year_level,
    preferredSubject: user.preferred_subject,
    preferredDifficulty: 'moderate',
  }
}

export async function registerUser(payload) {
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      username: payload.username,
      password: payload.password,
      role: payload.role,
      first_name: payload.firstName,
      last_name: payload.lastName,
      email: payload.email,
      school: payload.school,
      year_level: payload.grade,
      preferred_subject: payload.preferredSubject,
    }),
  })

  setAuthToken(data.access_token)

  return {
    user: mapBackendUser(data.user),
    accessToken: data.access_token,
  }
}

export async function loginUser({ username, password, role }) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username,
      password,
      role,
    }),
  })

  setAuthToken(data.access_token)

  return {
    user: mapBackendUser(data.user),
    accessToken: data.access_token,
  }
}

export async function fetchCurrentUser() {
  const data = await apiRequest('/auth/me')
  return {
    user: mapBackendUser(data.user),
  }
}

export function logoutUser() {
  setAuthToken(null)
}