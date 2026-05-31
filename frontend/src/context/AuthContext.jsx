import { createContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // On mount, verify token and fetch current user
  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('token')
      if (!storedToken) {
        setLoading(false)
        return
      }

      try {
        const response = await api.get('/users/me')
        const { name, email, role } = response.data
        setUser({ name, email, role })
        setToken(storedToken)
      } catch (error) {
        // If 401 or any auth error, clear everything
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
        }
      } finally {
        setLoading(false)
      }
    }

    verifyAuth()
  }, [])

  const login = useCallback((authResponse) => {
    const { token: authToken, name, email, role } = authResponse
    localStorage.setItem('token', authToken)
    setToken(authToken)
    setUser({ name, email, role })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    navigate('/login')
  }, [navigate])

  const isAdmin = user?.role === 'ADMIN'

  const value = {
    user,
    token,
    login,
    logout,
    isAdmin,
    loading,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
