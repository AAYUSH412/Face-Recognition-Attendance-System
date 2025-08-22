import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { EyeIcon, EyeSlashIcon, ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

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
  
  const strengthClass = (strength) => {
    if (strength <= 1) return 'bg-red-500'
    if (strength === 2) return 'bg-orange-500'
    if (strength === 3) return 'bg-yellow-500'
    if (strength === 4) return 'bg-green-500'
    return 'bg-green-600'
  }
  
  const strengthText = (strength) => {
    if (strength <= 1) return 'Very Weak'
    if (strength === 2) return 'Weak'
    if (strength === 3) return 'Medium'
    if (strength === 4) return 'Strong'
    return 'Very Strong'
  }
  
  const passwordStrength = getPasswordStrength(formData.password)
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <img 
              src="/icons8-attendance-48.png" 
              alt="Attendance System" 
              className="h-12 w-auto" 
            />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create your account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in
              </Link>
            </p>
          </div>

          {errors.general && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{errors.general}</h3>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8">
            <div className="mt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`block w-full appearance-none rounded-md border ${
                        errors.name ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                      } px-3 py-2 placeholder-gray-400 shadow-sm focus:outline-none sm:text-sm`}
                      aria-invalid={errors.name ? 'true' : 'false'}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                    />
                    {errors.name && (
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600" id="name-error">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`block w-full appearance-none rounded-md border ${
                        errors.email ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                      } px-3 py-2 placeholder-gray-400 shadow-sm focus:outline-none sm:text-sm`}
                      aria-invalid={errors.email ? 'true' : 'false'}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                    {errors.email && (
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600" id="email-error">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`block w-full appearance-none rounded-md border ${
                        errors.password ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                      } px-3 py-2 placeholder-gray-400 shadow-sm focus:outline-none sm:text-sm pr-10`}
                      aria-invalid={errors.password ? 'true' : 'false'}
                      aria-describedby={errors.password ? 'password-error' : undefined}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <EyeIcon className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                    {errors.password && (
                      <div className="pointer-events-none absolute inset-y-0 right-8 flex items-center">
                        <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  {errors.password ? (
                    <p className="mt-2 text-sm text-red-600" id="password-error">
                      {errors.password}
                    </p>
                  ) : formData.password && (
                    <div className="mt-2">
                      <div className="flex justify-between items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div className={`h-2 rounded-full ${strengthClass(passwordStrength)}`} style={{ width: `${(passwordStrength / 5) * 100}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-600">{strengthText(passwordStrength)}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`block w-full appearance-none rounded-md border ${
                        errors.confirmPassword ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                      } px-3 py-2 placeholder-gray-400 shadow-sm focus:outline-none sm:text-sm pr-10`}
                      aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                      aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                      onClick={toggleConfirmPasswordVisibility}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <EyeIcon className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                    {errors.confirmPassword ? (
                      <div className="pointer-events-none absolute inset-y-0 right-8 flex items-center">
                        <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
                      </div>
                    ) : (formData.confirmPassword && formData.password === formData.confirmPassword) && (
                      <div className="pointer-events-none absolute inset-y-0 right-8 flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600" id="confirmPassword-error">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="registrationId" className="block text-sm font-medium text-gray-700">
                    Registration/Student ID
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="registrationId"
                      name="registrationId"
                      type="text"
                      value={formData.registrationId}
                      onChange={handleChange}
                      className={`block w-full appearance-none rounded-md border ${
                        errors.registrationId ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                      } px-3 py-2 placeholder-gray-400 shadow-sm focus:outline-none sm:text-sm`}
                      aria-invalid={errors.registrationId ? 'true' : 'false'}
                      aria-describedby={errors.registrationId ? 'registrationId-error' : undefined}
                    />
                    {errors.registrationId && (
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  {errors.registrationId && (
                    <p className="mt-2 text-sm text-red-600" id="registrationId-error">
                      {errors.registrationId}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <div className="mt-1">
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                    </select>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating account...
                      </>
                    ) : (
                      'Create account'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-indigo-600 to-purple-800"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
          <h1 className="text-4xl font-bold text-white text-center mb-6">Face Recognition Attendance System</h1>
          <p className="text-white text-lg text-center max-w-md opacity-90">
            Join our platform and experience the future of attendance tracking
          </p>
          <div className="mt-8 bg-white/20 backdrop-blur-sm p-6 rounded-lg shadow-lg max-w-md">
            <h2 className="text-white text-xl font-semibold mb-4">Benefits of registration:</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-white">Contactless attendance marking</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-white">Secure facial recognition technology</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-white">Real-time attendance tracking</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-white">View and download your attendance history</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register