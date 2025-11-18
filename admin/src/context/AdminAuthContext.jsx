import { createContext, useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

const AdminAuthContext = createContext()

export const useAdminAuth = () => useContext(AdminAuthContext)

export const AdminAuthProvider = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('admin_token'))
  const [loading, setLoading] = useState(true)
  
  // Set up axios defaults
  axios.defaults.baseURL = 'http://localhost:4000'
  
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (token) {
          // Set the authorization header for all requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          // Fetch current admin data
          const response = await axios.get('/api/auth/me')
          
          // Verify user is actually an admin
          if (response.data.role !== 'admin') {
            throw new Error('Not authorized as admin')
          }
          
          setCurrentAdmin(response.data)
        }
      } catch (error) {
        console.error('Authentication error:', error)
        // Clear auth data if token is invalid
        localStorage.removeItem('admin_token')
        setToken(null)
        setCurrentAdmin(null)
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
      
      // Verify user is an admin
      if (user.role !== 'admin') {
        throw new Error('Not authorized as admin')
      }
      
      localStorage.setItem('admin_token', newToken)
      setToken(newToken)
      setCurrentAdmin(user)
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      
      return user
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Login failed'
    }
  }
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('admin_token')
    setToken(null)
    setCurrentAdmin(null)
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
    currentAdmin,
    loading,
    login,
    logout,
    isTokenExpired,
    isAuthenticated: !!token && !isTokenExpired() && currentAdmin?.role === 'admin'
  }
  
  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}