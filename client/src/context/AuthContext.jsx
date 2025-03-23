import { createContext, useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)
  
  // Set up axios defaults
  axios.defaults.baseURL = 'http://localhost:4000'
  
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (token) {
          // Set the authorization header for all requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          // Fetch current user data
          const response = await axios.get('/api/auth/me')
          setCurrentUser(response.data)
        }
      } catch (error) {
        console.error('Authentication error:', error)
        // Clear auth data if token is invalid
        localStorage.removeItem('token')
        setToken(null)
        setCurrentUser(null)
      } finally {
        setLoading(false)
      }
    }
    
    initAuth()
  }, [token])
  
  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password })
      const { token: newToken, user } = response.data
      
      localStorage.setItem('token', newToken)
      setToken(newToken)
      setCurrentUser(user)
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      
      return user
    } catch (error) {
      throw error.response?.data?.message || 'Login failed'
    }
  }
  
  // Register function
  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData)
      const { token: newToken, user } = response.data
      
      localStorage.setItem('token', newToken)
      setToken(newToken)
      setCurrentUser(user)
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      
      return user
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed'
    }
  }
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setCurrentUser(null)
    delete axios.defaults.headers.common['Authorization']
  }
  
  // Check if token is expired
  const isTokenExpired = () => {
    if (!token) return true
    
    try {
      const decoded = jwtDecode(token)
      return decoded.exp * 1000 < Date.now()
    } catch (error) {
      return true
    }
  }
  
  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    isTokenExpired,
    isAuthenticated: !!token && !isTokenExpired()
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}