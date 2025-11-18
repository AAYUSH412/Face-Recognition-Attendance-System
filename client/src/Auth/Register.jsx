import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, AlertCircle, CheckCircle, User, Mail, Lock, IdCard } from 'lucide-react'
import { Button, SkipLink, LiveRegion } from '../components/ui'
import Input from '../components/ui/Input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    registrationId: '',
    role: 'student'
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    
    // For password confirmation, check match when typing
    if (name === 'confirmPassword' || (name === 'password' && formData.confirmPassword)) {
      if (name === 'password' && value !== formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }))
      } else if (name === 'confirmPassword' && value !== formData.password) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }))
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: '' }))
      }
    }
  }
  
  const validateForm = () => {
    const newErrors = {}
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
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
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    // Registration ID validation
    if (!formData.registrationId.trim()) {
      newErrors.registrationId = 'Registration ID is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword: _, ...userData } = formData
      await register(userData)
      toast.success('Registration successful!')
      navigate('/')
    } catch (error) {
      console.error('Registration error:', error)
      
      // Handle specific error messages
      if (error.toString().includes('already exists')) {
        setErrors({
          email: 'This email is already registered',
          general: 'An account with this email already exists'
        })
      } else {
        setErrors({
          general: error.toString()
        })
      }
      
      toast.error('Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }
  
  // Calculate password strength
  const getPasswordStrength = (password) => {
    if (!password) return 0
    
    let strength = 0
    // At least 8 characters
    if (password.length >= 8) strength += 1
    // Contains lowercase letters
    if (/[a-z]/.test(password)) strength += 1
    // Contains uppercase letters
    if (/[A-Z]/.test(password)) strength += 1
    // Contains numbers
    if (/[0-9]/.test(password)) strength += 1
    // Contains special characters
    if (/[^A-Za-z0-9]/.test(password)) strength += 1
    
    return strength
  }
  
  const getStrengthColor = (strength) => {
    if (strength <= 1) return 'bg-error-500'
    if (strength === 2) return 'bg-warning-500'
    if (strength === 3) return 'bg-warning-400'
    if (strength === 4) return 'bg-success-500'
    return 'bg-success-600'
  }
  
  const getStrengthText = (strength) => {
    if (strength <= 1) return 'Very Weak'
    if (strength === 2) return 'Weak'
    if (strength === 3) return 'Medium'
    if (strength === 4) return 'Strong'
    return 'Very Strong'
  }
  
  const passwordStrength = getPasswordStrength(formData.password)
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background-primary to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <SkipLink href="#register-form">Skip to registration form</SkipLink>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img 
            src="/Face Recognition Attendance System-logo.png" 
            alt="Face Recognition Attendance System" 
            className="mx-auto h-16 w-auto object-contain" 
          />
          <h1 className="mt-6 text-3xl font-heading font-bold text-text-primary">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Join our attendance tracking platform
          </p>
        </div>

        <Card id="register-form" className="mt-8 shadow-medium" role="main" aria-labelledby="register-title">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle id="register-title" className="text-center text-xl">Sign up</CardTitle>
            <CardDescription className="text-center">
              Enter your information to create your account
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

            <form onSubmit={handleSubmit} className="space-y-6" role="form" aria-labelledby="register-title">
              <LiveRegion>
                {errors.general && `Error: ${errors.general}`}
                {Object.keys(errors).length > 0 && !errors.general && 'Please correct the errors in the form'}
              </LiveRegion>
              
              <div className="space-y-4">
                {/* Name Field */}
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Full Name
                    <span className="text-red-500 ml-1" aria-label="required">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-text-muted" aria-hidden="true" />
                    </div>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      error={!!errors.name}
                      aria-describedby={errors.name ? "name-error" : undefined}
                      aria-invalid={!!errors.name}
                      required
                      disabled={loading}
                      className="pl-10"
                    />
                  </div>
                  {errors.name && (
                    <p id="name-error" className="form-error" role="alert" aria-live="polite">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email address
                    <span className="text-red-500 ml-1" aria-label="required">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-text-muted" aria-hidden="true" />
                    </div>
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
                      className="pl-10"
                    />
                  </div>
                  {errors.email && (
                    <p id="email-error" className="form-error" role="alert" aria-live="polite">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Registration ID Field */}
                <div className="form-group">
                  <label htmlFor="registrationId" className="form-label">
                    Registration/Student ID
                    <span className="text-red-500 ml-1" aria-label="required">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IdCard className="h-4 w-4 text-text-muted" aria-hidden="true" />
                    </div>
                    <Input
                      id="registrationId"
                      name="registrationId"
                      type="text"
                      placeholder="Enter your registration ID"
                      value={formData.registrationId}
                      onChange={handleChange}
                      error={!!errors.registrationId}
                      aria-describedby={errors.registrationId ? "registrationId-error" : undefined}
                      aria-invalid={!!errors.registrationId}
                      required
                      disabled={loading}
                      className="pl-10"
                    />
                  </div>
                  {errors.registrationId && (
                    <p id="registrationId-error" className="form-error" role="alert" aria-live="polite">
                      {errors.registrationId}
                    </p>
                  )}
                </div>

                {/* Role Field */}
                <div className="form-group">
                  <label htmlFor="role" className="form-label">
                    Role
                    <span className="text-red-500 ml-1" aria-label="required">*</span>
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={loading}
                    className="block w-full px-3 py-2 border border-border-light bg-background-surface text-text-primary rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                  </select>
                </div>

                {/* Password Field */}
                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Password
                    <span className="text-red-500 ml-1" aria-label="required">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-text-muted" aria-hidden="true" />
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      error={!!errors.password}
                      aria-describedby={errors.password ? "password-error" : undefined}
                      aria-invalid={!!errors.password}
                      required
                      disabled={loading}
                      className="pl-10 pr-10"
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
                  
                  {/* Password Strength Indicator */}
                  {formData.password && !errors.password && (
                    <div className="mt-2">
                      <div className="flex justify-between items-center">
                        <div className="w-full bg-border-light rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`} 
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-text-muted whitespace-nowrap ml-2">
                          {getStrengthText(passwordStrength)}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {errors.password && (
                    <p id="password-error" className="form-error" role="alert" aria-live="polite">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm Password
                    <span className="text-red-500 ml-1" aria-label="required">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-text-muted" aria-hidden="true" />
                    </div>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={!!errors.confirmPassword}
                      aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                      aria-invalid={!!errors.confirmPassword}
                      required
                      disabled={loading}
                      className="pl-10 pr-10"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center">
                      {formData.confirmPassword && formData.password === formData.confirmPassword && !errors.confirmPassword && (
                        <CheckCircle className="h-4 w-4 text-success-500 mr-2" aria-hidden="true" />
                      )}
                      <button
                        type="button"
                        className="pr-3 flex items-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
                        onClick={toggleConfirmPasswordVisibility}
                        disabled={loading}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        aria-pressed={showConfirmPassword}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-text-muted hover:text-text-secondary" aria-hidden="true" />
                        ) : (
                          <Eye className="h-4 w-4 text-text-muted hover:text-text-secondary" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>
                  {errors.confirmPassword && (
                    <p id="confirmPassword-error" className="form-error" role="alert" aria-live="polite">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full"
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </Button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border-light" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background-surface text-text-muted">Already have an account?</span>
                </div>
              </div>

              <div className="mt-6">
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    Sign in to your account
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-text-muted">
          By creating an account, you agree to our{' '}
          <a href="#" className="text-primary-600 hover:text-primary-500">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-primary-600 hover:text-primary-500">Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}

export default Register