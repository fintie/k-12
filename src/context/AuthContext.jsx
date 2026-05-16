import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { loginUser, registerUser } from '@/services/auth-service'

const AuthContext = createContext(null)
const STORAGE_KEY = 'nextgenius-auth-user'

const loadStoredUser = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (storageError) {
    console.error('Failed to read stored auth state', storageError)
    return null
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => loadStoredUser())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  const persistUser = (nextUser) => {
    setUser(nextUser)
    try {
      if (nextUser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch (storageError) {
      console.error('Failed to persist auth state', storageError)
    }
  }

  const handleAuth = async (action) => {
    setError(null)
    try {
      const result = await action()
      const nextUser = result?.user ?? result
      persistUser(nextUser)
      return nextUser
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Authentication failed')
      throw authError
    }
  }

  const login = (credentials) => handleAuth(() => loginUser(credentials))
  const register = (payload) => handleAuth(() => registerUser(payload))

  const logout = () => {
    setError(null)
    persistUser(null)
  }

  const clearError = useCallback(() => setError(null), [])

  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
