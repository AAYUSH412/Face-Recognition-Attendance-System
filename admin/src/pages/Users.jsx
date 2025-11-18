import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { 
  Plus, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Edit,
  Trash2,
  Users as UsersIcon,
  GraduationCap,
  User,
  Building2,
  Mail,
  Phone,
  MoreHorizontal,
  Filter
} from 'lucide-react'
import { usersAPI, departmentsAPI } from '../lib/api'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0) // Add total users count
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    registrationId: '',
    departmentId: ''
  })
  const [departments, setDepartments] = useState([])
  
  // Fetch functions with useCallback to avoid dependency issues
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      // Use server-side pagination and filtering
      const params = {
        page: currentPage,
        limit: 10, // Items per page
        ...(selectedRole && { role: selectedRole }),
        ...(searchTerm && { search: searchTerm })
      }
      
      const response = await usersAPI.getAll(params)
      
      // Handle server-side paginated response
      if (response.data.users && response.data.pagination) {
        // Server returned paginated response
        setUsers(response.data.users)
        setTotalPages(response.data.pagination.pages)
        setTotalUsers(response.data.pagination.total)
      } else if (Array.isArray(response.data)) {
        // Fallback: server returned direct array (older API version)
        setUsers(response.data)
        setTotalPages(1)
        setTotalUsers(response.data.length)
      } else {
        // Unexpected response format
        console.error('Unexpected API response format:', response.data)
        setUsers([])
        setTotalPages(1)
        setTotalUsers(0)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
      setUsers([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }, [currentPage, selectedRole, searchTerm])
  
  const fetchDepartments = useCallback(async () => {
    try {
      const response = await departmentsAPI.getAll()
      // Departments API returns direct array
      setDepartments(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error('Error fetching departments:', error)
      setDepartments([]) // Set empty array on error
    }
  }, [])

  // Fetch users on component mount and when dependencies change
  useEffect(() => {
    fetchUsers()
    fetchDepartments()
  }, [fetchUsers, fetchDepartments])

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1) // Reset to first page when search changes
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [searchTerm])
  
  const handleRoleFilter = (role) => {
    setSelectedRole(role)
    setCurrentPage(1) // Reset to first page on new filter
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }
  
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewUser(prev => ({ ...prev, [name]: value }))
  }
  
  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      // Prepare user data with correct field names
      const userData = {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        registrationId: newUser.registrationId || null,
        departmentId: newUser.departmentId || null // This will be mapped to 'department' on the backend
      }
      
      await usersAPI.create(userData)
      toast.success('User created successfully')
      setIsModalOpen(false)
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'student',
        registrationId: '',
        departmentId: ''
      })
      fetchUsers() // Refresh users list
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error(error.response?.data?.message || 'Failed to create user')
    }
  }
  
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return
    
    try {
      await usersAPI.delete(userId)
      toast.success('User deleted successfully')
      fetchUsers() // Refresh users list
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    }
  }
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Users</h1>
          <p className="text-muted-foreground">
            Manage all users in your system including students, faculty, and administrators.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <div className="flex gap-2">
                <Button
                  variant={selectedRole === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleRoleFilter('')}
                >
                  All
                </Button>
                <Button
                  variant={selectedRole === 'student' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleRoleFilter('student')}
                  className="gap-1"
                >
                  <GraduationCap className="h-3 w-3" />
                  Students
                </Button>
                <Button
                  variant={selectedRole === 'faculty' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleRoleFilter('faculty')}
                  className="gap-1"
                >
                  <User className="h-3 w-3" />
                  Faculty
                </Button>
                <Button
                  variant={selectedRole === 'admin' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleRoleFilter('admin')}
                  className="gap-1"
                >
                  <UsersIcon className="h-3 w-3" />
                  Admins
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : users.length > 0 ? (
            <div className="divide-y">
              {users.map((user) => (
                <div key={user._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar name={user.name} size="md" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{user.name}</h3>
                          <Badge 
                            variant={
                              user.role === 'admin' ? 'destructive' : 
                              user.role === 'faculty' ? 'default' : 
                              'secondary'
                            }
                          >
                            {user.role}
                          </Badge>
                          <Badge 
                            variant={user.isActive !== false ? 'success' : 'destructive'}
                          >
                            {user.isActive !== false ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                          {user.registrationId && (
                            <span>ID: {user.registrationId}</span>
                          )}
                          {user.department?.name && (
                            <div className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {user.department.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/users/${user._id}`} className="gap-1">
                          Edit
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteUser(user._id)}
                        className="gap-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No users match your current search and filter criteria.
              </p>
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, totalUsers)} of {totalUsers} users
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
                    disabled={currentPage === 1}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-3 w-3" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(page => Math.min(page + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="gap-1"
                  >
                    Next
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Add New User</CardTitle>
              <CardDescription>
                Create a new user account in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUser} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={newUser.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={newUser.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={newUser.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="role" className="text-sm font-medium">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={newUser.role}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="registrationId" className="text-sm font-medium">
                      Registration ID {newUser.role === 'student' && <span className="text-red-500">*</span>}
                    </label>
                    <Input
                      id="registrationId"
                      name="registrationId"
                      value={newUser.registrationId}
                      onChange={handleInputChange}
                      required={newUser.role === 'student'}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="departmentId" className="text-sm font-medium">
                      Department
                    </label>
                    <select
                      id="departmentId"
                      name="departmentId"
                      value={newUser.departmentId}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept._id} value={dept._id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    Create User
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default Users