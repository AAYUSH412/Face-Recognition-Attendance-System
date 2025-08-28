import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Button, SkipLink, LiveRegion } from '../components/ui'
import Input from '../components/ui/Input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }
  
  const validateForm = () => {
    const newErrors = {}
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid'
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      await login(formData.email, formData.password)
      toast.success('Login successful!')
      navigate('/')
    } catch (error) {
      console.error('Login error:', error)
      
      // Handle specific error messages
      if (error.toString().includes('Invalid credentials')) {
        setErrors({
          general: 'Invalid email or password. Please try again.'
        })
      } else {
        setErrors({
          general: error.toString()
        })
      }
      
      toast.error('Login failed')
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background-primary to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <SkipLink href="#login-form">Skip to login form</SkipLink>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img 
            src="/Face Recognition Attendance System-logo.png" 
            alt="Face Recognition Attendance System" 
            className="mx-auto h-16 w-auto object-contain" 
          />
          <h1 className="mt-6 text-3xl font-heading font-bold text-text-primary">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Sign in to your attendance account
          </p>
        </div>

        <Card id="login-form" className="mt-8 shadow-medium" role="main" aria-labelledby="login-title">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle id="login-title" className="text-center text-xl">Sign in</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {errors.general && (
              <div className="rounded-lg bg-error-50 border border-error-200 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-error-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-error-800">{errors.general}</h3>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" role="form" aria-labelledby="login-title">
              <LiveRegion>
                {errors.general && `Error: ${errors.general}`}
                {Object.keys(errors).length > 0 && !errors.general && 'Please correct the errors in the form'}
              </LiveRegion>
              
              <div className="space-y-4">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email address
                    <span className="text-red-500 ml-1" aria-label="required">*</span>
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    aria-invalid={!!errors.email}
                    required
                    disabled={loading}
                  />
                  {errors.email && (
                    <p id="email-error" className="form-error" role="alert" aria-live="polite">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Password
                    <span className="text-red-500 ml-1" aria-label="required">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      error={!!errors.password}
                      aria-describedby={errors.password ? "password-error" : undefined}
                      aria-invalid={!!errors.password}
                      required
                      disabled={loading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
                      onClick={togglePasswordVisibility}
                      disabled={loading}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-text-muted hover:text-text-secondary" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4 text-text-muted hover:text-text-secondary" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p id="password-error" className="form-error" role="alert" aria-live="polite">
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-border-light rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-text-secondary">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                    Forgot your password?
                  </a>
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full"
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border-light" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background-surface text-text-muted">New to our platform?</span>
                </div>
              </div>

              <div className="mt-6">
                <Link to="/register">
                  <Button variant="outline" className="w-full">
                    Create new account
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-text-muted">
          By signing in, you agree to our{' '}
          <a href="#" className="text-primary-600 hover:text-primary-500">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-primary-600 hover:text-primary-500">Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}

export default Login
