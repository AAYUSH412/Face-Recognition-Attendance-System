import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'
import toast from 'react-hot-toast'
import { EyeIcon, EyeSlashIcon, ShieldCheckIcon, KeyIcon } from '@heroicons/react/24/outline'
import { BuildingOfficeIcon } from '@heroicons/react/24/solid'

const AdminLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAdminAuth()
  const navigate = useNavigate()
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await login(email, password)
      toast.success('Login successful!')
      navigate('/')
    } catch (error) {
      toast.error(error.toString())
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }
  
  return (
    <div className="min-h-screen flex">
      {/* Left side - Login form */}
      <div className="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-sm">
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-purple-600 rounded-full flex items-center justify-center">
              <BuildingOfficeIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to the administrator panel
          </p>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm pr-10"
                    placeholder="Enter your password"
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
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
            
            <div className="mt-6 bg-purple-50 border border-purple-100 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ShieldCheckIcon className="h-5 w-5 text-purple-600" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-purple-800">Admin Access Only</h3>
                  <div className="mt-2 text-sm text-purple-700">
                    <p>This portal is restricted to administrators only. Unauthorized access attempts are logged and monitored.</p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {/* Right side - Background/Illustration */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-purple-600 to-indigo-800"></div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-lg max-w-md text-white">
            <h2 className="text-2xl font-bold mb-4">Face Recognition Attendance System</h2>
            <p className="mb-6 opacity-90">Welcome to the admin management panel. From here you can manage users, departments, and verify attendance records.</p>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <KeyIcon className="h-6 w-6 text-purple-300 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Comprehensive Management</h3>
                  <p className="text-sm opacity-80">Manage all users, departments, and attendance records from one place</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <ShieldCheckIcon className="h-6 w-6 text-purple-300 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Verification System</h3>
                  <p className="text-sm opacity-80">Verify attendance records to ensure system integrity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin