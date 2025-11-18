import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import { Button } from '../components/ui/Button'
import UserDetailInfo from '../components/users/UserDetailInfo'
import UserEditForm from '../components/users/UserEditForm'
import UserAttendanceHistory from '../components/users/UserAttendanceHistory'
import UserActions from '../components/users/UserActions'
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton'

const UserDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [recentAttendance, setRecentAttendance] = useState([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [resetting, setResetting] = useState(false)
  
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
        setRecentAttendance(attendanceResponse.data.records?.slice(0, 10) || [])
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
  
  const handleSubmit = async () => {
    setSaving(true)
    try {
      await axios.put(`/api/users/${id}`, formData)
      toast.success('User updated successfully')
      
      // Refresh user data
      const response = await axios.get(`/api/users/${id}`)
      setUser(response.data)
      setEditing(false)
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error(error.response?.data?.message || 'Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset form data to original user data
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      registrationId: user.registrationId || '',
      departmentId: user.department?._id || ''
    })
    setEditing(false)
  }

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/users/${id}`)
      toast.success('User deleted successfully')
      navigate('/users')
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error(error.response?.data?.message || 'Failed to delete user')
    }
  }

  const handlePasswordReset = async (password) => {
    setResetting(true)
    try {
      await axios.post(`/api/users/${id}/reset-password`, { newPassword: password })
      toast.success('Password reset successfully')
      setNewPassword('')
      setShowPasswordReset(false)
    } catch (error) {
      console.error('Error resetting password:', error)
      toast.error(error.response?.data?.message || 'Failed to reset password')
    } finally {
      setResetting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-16" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <LoadingSkeleton className="h-64" />
            <LoadingSkeleton className="h-96" />
          </div>
          <div>
            <LoadingSkeleton className="h-64" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">User not found</h3>
        <p className="mt-2 text-sm text-gray-600">
          The user you're looking for doesn't exist or has been deleted.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/users">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Users
            </Link>
          </Button>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
          <p className="mt-2 text-gray-600">
            View and manage user information and attendance history
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Info */}
          <UserDetailInfo user={user} />

          {/* Edit Form */}
          <UserEditForm
            formData={formData}
            setFormData={setFormData}
            departments={departments}
            saving={saving}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            editing={editing}
            setEditing={setEditing}
          />

          {/* Attendance History */}
          <UserAttendanceHistory recentAttendance={recentAttendance} />
        </div>

        {/* Sidebar */}
        <div>
          <UserActions
            user={user}
            onDelete={handleDelete}
            onPasswordReset={handlePasswordReset}
            showDeleteConfirm={showDeleteConfirm}
            setShowDeleteConfirm={setShowDeleteConfirm}
            showPasswordReset={showPasswordReset}
            setShowPasswordReset={setShowPasswordReset}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            resetting={resetting}
          />
        </div>
      </div>
    </div>
  )
}

export default UserDetail
