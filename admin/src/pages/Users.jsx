import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
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
  
  // Fetch users on component mount
  useEffect(() => {
    fetchUsers()
    fetchDepartments()
  }, [currentPage, selectedRole])
  
  const fetchUsers = async () => {
    setLoading(true)
    try {
      // In a real implementation, you would use query params for pagination and filtering
      const response = await axios.get('/api/users')
      
      // Filter data based on search term and role
      let filteredUsers = response.data
      
      if (selectedRole) {
        filteredUsers = filteredUsers.filter(user => user.role === selectedRole)
      }
      
      if (searchTerm) {
        filteredUsers = filteredUsers.filter(user => 
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.registrationId?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      
      // Simple pagination (client-side for demo)
      const itemsPerPage = 10
      const totalItems = filteredUsers.length
      const pages = Math.ceil(totalItems / itemsPerPage)
      
      setTotalPages(pages || 1)
      
      // Adjust current page if it's out of bounds after filtering
      const validPage = Math.min(currentPage, pages || 1)
      if (validPage !== currentPage) {
        setCurrentPage(validPage)
      }
      
      // Get current page items
      const startIndex = (validPage - 1) * itemsPerPage
      const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage)
      
      setUsers(paginatedUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }
  
  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/departments')
      setDepartments(response.data)
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }
  
  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1) // Reset to first page on new search
    fetchUsers()
  }
  
  const handleRoleFilter = (role) => {
    setSelectedRole(role)
    setCurrentPage(1) // Reset to first page on new filter
  }
  
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewUser(prev => ({ ...prev, [name]: value }))
  }
  
  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/auth/register', newUser)
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
      await axios.delete(`/api/users/${userId}`)
      toast.success('User deleted successfully')
      fetchUsers() // Refresh users list
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    }
  }
  
  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the users in your system including their name, email, and role.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add User
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <form onSubmit={handleSearch} className="relative rounded-md shadow-sm max-w-md">
              <input
                type="text"
                name="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="focus:ring-purple-500 focus:border-purple-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search users..."
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="submit"
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </form>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleRoleFilter('')}
                className={`inline-flex items-center px-3 py-1.5 border ${
                  selectedRole === '' ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-300 text-gray-700 bg-white'
                } text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => handleRoleFilter('student')}
                className={`inline-flex items-center px-3 py-1.5 border ${
                  selectedRole === 'student' ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-300 text-gray-700 bg-white'
                } text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
              >
                Students
              </button>
              <button
                type="button"
                onClick={() => handleRoleFilter('faculty')}
                className={`inline-flex items-center px-3 py-1.5 border ${
                  selectedRole === 'faculty' ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-300 text-gray-700 bg-white'
                } text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
              >
                Faculty
              </button>
              <button
                type="button"
                onClick={() => handleRoleFilter('admin')}
                className={`inline-flex items-center px-3 py-1.5 border ${
                  selectedRole === 'admin' ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-300 text-gray-700 bg-white'
                } text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
              >
                Admins
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Users List */}
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
            <p className="mt-2 text-gray-500">Loading users...</p>
          </div>
        ) : users.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {users.map((user) => (
              <li key={user._id}>
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium mr-4">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex text-sm">
                          <p className="font-medium text-purple-600 truncate">{user.name}</p>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'admin' ? 'bg-red-100 text-red-800' : 
                            user.role === 'faculty' ? 'bg-blue-100 text-blue-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                        <div className="mt-1 flex">
                          <div className="flex items-center text-sm text-gray-500">
                            <span>{user.email}</span>
                            {user.registrationId && (
                              <>
                                <span className="mx-2">&bull;</span>
                                <span>ID: {user.registrationId}</span>
                              </>
                            )}
                            {user.department?.name && (
                              <>
                                <span className="mx-2">&bull;</span>
                                <span>Dept: {user.department.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                    <div className="flex -space-x-1 overflow-hidden">
                      <Link
                        to={`/users/${user._id}`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(user._id)}
                        className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No users found matching your criteria</p>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <nav
            className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
            aria-label="Pagination"
          >
            <div className="hidden sm:block">
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{currentPage}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div className="flex-1 flex justify-between sm:justify-end">
              <button
                onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ChevronLeftIcon className="h-5 w-5 mr-1" />
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(page => Math.min(page + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Next
                <ChevronRightIcon className="h-5 w-5 ml-1" />
              </button>
            </div>
          </nav>
        )}
      </div>
      
      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Add New User
                </h3>
                <form onSubmit={handleCreateUser} className="mt-4">
                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
                      <p className="mt-1 text-sm text-gray-500">Basic user credentials and access level.</p>
                      <div className="mt-4 grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            value={newUser.name}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            required
                            value={newUser.email}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="password"
                            name="password"
                            id="password"
                            required
                            value={newUser.password}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                          />
                          <p className="mt-1 text-xs text-gray-500">Password must be at least 8 characters.</p>
                        </div>
                        <div className="sm:col-span-3">
                          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                            Role <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="role"
                            name="role"
                            value={newUser.role}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                          >
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Additional Details</h3>
                      <p className="mt-1 text-sm text-gray-500">Organization information for the user.</p>
                      <div className="mt-4 grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                          <label htmlFor="registrationId" className="block text-sm font-medium text-gray-700">
                            Registration ID {newUser.role === 'student' && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            type="text"
                            name="registrationId"
                            id="registrationId"
                            required={newUser.role === 'student'}
                            value={newUser.registrationId}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            {newUser.role === 'student' 
                              ? "Student ID is required for enrollment verification." 
                              : "Optional identifier for faculty or admin."}
                          </p>
                        </div>
                        <div className="sm:col-span-3">
                          <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700">
                            Department
                          </label>
                          <select
                            id="departmentId"
                            name="departmentId"
                            value={newUser.departmentId}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                          >
                            <option value="">Select Department</option>
                            {departments.map(dept => (
                              <option key={dept._id} value={dept._id}>{dept.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:col-start-2 sm:text-sm"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users