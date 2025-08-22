import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { 
  ArrowLeftIcon, 
  UserIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

const UserDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [recentAttendance, setRecentAttendance] = useState([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    registrationId: '',
    departmentId: ''
  })

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true)
      try {
        const [userResponse, departmentsResponse] = await Promise.all([
          axios.get(`/api/users/${id}`),
          axios.get('/api/departments')
        ])
        
        const userData = userResponse.data
        setUser(userData)
        setFormData({
          name: userData.name,
          email: userData.email,
          role: userData.role,
          registrationId: userData.registrationId || '',
          departmentId: userData.department?._id || ''
        })
        setDepartments(departmentsResponse.data)
        
        // Get recent attendance records
        const today = new Date()
        const thirtyDaysAgo = new Date(today)
        thirtyDaysAgo.setDate(today.getDate() - 30)
        
        const startDate = thirtyDaysAgo.toISOString().split('T')[0]
        const endDate = today.toISOString().split('T')[0]
        
        const attendanceResponse = await axios.get(`/api/attendance?userId=${id}&startDate=${startDate}&endDate=${endDate}`)
        setRecentAttendance(attendanceResponse.data.records?.slice(0, 10) || []) // Show only 10 most recent records
      } catch (error) {
        console.error('Error fetching user details:', error)
        toast.error('User not found or error fetching details')
        navigate('/users')
      } finally {
        setLoading(false)
      }
    }
    
    fetchUserData()
  }, [id, navigate])
  
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      await axios.put(`/api/users/${id}`, formData)
      toast.success('User updated successfully')
      
      // Refresh user data
      const response = await axios.get(`/api/users/${id}`)
      setUser(response.data)
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error(error.response?.data?.message || 'Failed to update user')
    } finally {
      setSaving(false)
    }
  }
  
  const handleDelete = async () => {
    try {
      await axios.delete(`/api/users/${id}`)
      toast.success('User deleted successfully')
      navigate('/users')
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    }
  }
  
  const handlePasswordReset = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }
    
    try {
      await axios.put(`/api/users/${id}/password`, { newPassword })
      toast.success('Password reset successfully')
      setShowPasswordReset(false)
      setNewPassword('')
    } catch (error) {
      console.error('Error resetting password:', error)
      toast.error(error.response?.data?.message || 'Failed to reset password')
    }
  }
  
  const handleToggleStatus = async () => {
    try {
      const response = await axios.patch(`/api/users/${id}/status`)
      toast.success(response.data.message)
      setUser(response.data.user)
    } catch (error) {
      console.error('Error toggling user status:', error)
      toast.error(error.response?.data?.message || 'Failed to update user status')
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    )
  }
  
  if (!user) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              User not found. This user may have been deleted.
            </p>
            <div className="mt-4">
              <Link
                to="/users"
                className="inline-flex items-center text-sm font-medium text-yellow-700 hover:text-yellow-600"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-1" />
                Return to users list
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div>
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link to="/" className="text-gray-500 hover:text-gray-700">
              Dashboard
            </Link>
          </li>
          <li className="flex items-center">
            <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-1" />
            <Link to="/users" className="text-gray-500 hover:text-gray-700">
              Users
            </Link>
          </li>
          <li className="flex items-center">
            <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-1" />
            <span className="text-gray-900 font-medium">
              {user?.name || 'User Details'}
            </span>
          </li>
        </ol>
      </nav>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
            <Link to="/users" className="mr-2 text-gray-500 hover:text-gray-700">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            User Details
          </h1>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleToggleStatus}
              className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${
                user?.isActive
                  ? 'text-white bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
                  : 'text-white bg-green-600 hover:bg-green-700 focus:ring-green-500'
              } focus:outline-none focus:ring-2 focus:ring-offset-2`}
            >
              {user?.isActive ? (
                <>
                  <XCircleIcon className="-ml-0.5 mr-2 h-4 w-4" />
                  Deactivate User
                </>
              ) : (
                <>
                  <CheckCircleIcon className="-ml-0.5 mr-2 h-4 w-4" />
                  Activate User
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowPasswordReset(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Reset Password
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <XCircleIcon className="-ml-0.5 mr-2 h-4 w-4" />
              Delete User
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex items-center">
          <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
            <UserIcon className="h-6 w-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">{user.name}</h3>
              <span
                className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {user.email} • <span className="capitalize">{user.role}</span>
              {user.department && ` • ${user.department.name}`}
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <div className="mt-1">
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="registrationId" className="block text-sm font-medium text-gray-700">
                    Registration ID
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="registrationId"
                      id="registrationId"
                      value={formData.registrationId}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <div className="mt-1">
                    <select
                      id="departmentId"
                      name="departmentId"
                      value={formData.departmentId}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="">No Department</option>
                      {departments.map(dept => (
                        <option key={dept._id} value={dept._id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Link
                  to="/users"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 mr-3"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                    saving ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Recent Attendance */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Recent Attendance Records</h2>
        <div className="mt-4 bg-white shadow sm:rounded-lg overflow-hidden">
          {recentAttendance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check In
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check Out
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentAttendance.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50 transition-all duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                          {new Date(record.date).toLocaleDateString(undefined, { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.checkIn?.time ? (
                          <div className="flex items-center">
                            <div className={`flex-shrink-0 h-8 w-8 rounded-full ${record.checkIn.verified ? 'bg-green-100' : 'bg-yellow-100'} flex items-center justify-center mr-2`}>
                              {record.checkIn.verified ? 
                                <CheckCircleIcon className="h-5 w-5 text-green-600" /> : 
                                <ClockIcon className="h-5 w-5 text-yellow-600" />
                              }
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {new Date(record.checkIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              <div className="text-xs text-gray-500">
                                {record.checkIn.verified ? 'Verified' : 'Pending verification'}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Not recorded
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.checkOut?.time ? (
                          <div className="flex items-center">
                            {record.checkOut.verified ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-1.5" />
                            ) : (
                              <XCircleIcon className="h-5 w-5 text-yellow-500 mr-1.5" />
                            )}
                            <span className="text-sm text-gray-900">
                              {new Date(record.checkOut.time).toLocaleTimeString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">--</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.status === 'present' ? 'bg-green-100 text-green-800' :
                          record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                          record.status === 'absent' ? 'bg-red-100 text-red-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {record.status || 'Unknown'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 px-4">
              <p className="text-gray-500">No recent attendance records found for this user.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Delete User</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this user? All of their data will be permanently removed
                      from our servers forever. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDelete}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Password Reset Modal */}
      {showPasswordReset && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                  <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Reset Password
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Enter a new password for {user.name}. The user will need to use this password to log in.
                    </p>
                  </div>
                  <div className="mt-4">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 6 characters)"
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:col-start-2 sm:text-sm"
                >
                  Reset Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordReset(false)
                    setNewPassword('')
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserDetail