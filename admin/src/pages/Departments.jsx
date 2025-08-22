import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BuildingOfficeIcon,
  UsersIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  FunnelIcon,
  EyeIcon,
  ChartBarIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'

const Departments = () => {
  const [departments, setDepartments] = useState([])
  const [allDepartments, setAllDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [departmentForm, setDepartmentForm] = useState({
    name: '',
    description: '',
    code: ''
  })
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null)
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [departmentStats, setDepartmentStats] = useState(null)
  const [userCounts, setUserCounts] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const paginateDepartments = (departmentsArray) => {
    // Simple pagination
    const itemsPerPage = 10
    const totalItems = departmentsArray.length
    const pages = Math.ceil(totalItems / itemsPerPage)
    
    setTotalPages(pages || 1)
    
    // Get current page items
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedDepartments = departmentsArray.slice(startIndex, startIndex + itemsPerPage)
    
    setDepartments(paginatedDepartments)
  }
  
  const filterDepartments = () => {
    if (!searchTerm.trim()) {
      paginateDepartments(allDepartments)
      return
    }
    
    const filtered = allDepartments.filter(dept => 
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    paginateDepartments(filtered)
    setCurrentPage(1) // Reset to first page on search
  }

  const fetchDepartments = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/departments')
      const departments = response.data
      
      setAllDepartments(departments)
      // Don't call pagination here, let useEffect handle it
      
      // Fetch user counts for departments
      fetchUserCounts(departments)
    } catch (error) {
      console.error('Error fetching departments:', error)
      toast.error('Failed to load departments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount
  
  useEffect(() => {
    if (searchTerm) {
      filterDepartments()
    } else {
      paginateDepartments(allDepartments)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, allDepartments, currentPage]) // Add currentPage dependency

  const fetchUserCounts = async (departments) => {
    const countPromises = departments.map(async (dept) => {
      try {
        const countResponse = await axios.get(`/api/departments/${dept._id}/users/count`)
        return { [dept._id]: countResponse.data.count }
      } catch (error) {
        console.error(`Error fetching user count for department ${dept._id}:`, error)
        return { [dept._id]: 0 }
      }
    })
    
    const counts = await Promise.all(countPromises)
    const countsObject = counts.reduce((acc, curr) => ({ ...acc, ...curr }), {})
    setUserCounts(countsObject)
  }
  
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDepartments()
    setRefreshing(false)
    toast.success('Departments refreshed')
  }
  
  const resetForm = () => {
    setDepartmentForm({
      name: '',
      description: '',
      code: ''
    })
    setIsEditMode(false)
    setSelectedDepartmentId(null)
  }
  
  const openModal = (department = null) => {
    if (department) {
      setDepartmentForm({
        name: department.name,
        description: department.description || '',
        code: department.code || ''
      })
      setIsEditMode(true)
      setSelectedDepartmentId(department._id)
    } else {
      resetForm()
    }
    setIsModalOpen(true)
  }
  
  const closeModal = () => {
    setIsModalOpen(false)
    resetForm()
  }
  
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setDepartmentForm(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (isEditMode) {
        await axios.put(`/api/departments/${selectedDepartmentId}`, departmentForm)
        toast.success('Department updated successfully')
      } else {
        await axios.post('/api/departments', departmentForm)
        toast.success('Department created successfully')
      }
      
      closeModal()
      fetchDepartments()
    } catch (error) {
      console.error('Error saving department:', error)
      toast.error(error.response?.data?.message || 'Failed to save department')
    }
  }
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department? This will affect all users assigned to it.')) return
    
    try {
      await axios.delete(`/api/departments/${id}`)
      toast.success('Department deleted successfully')
      fetchDepartments()
    } catch (error) {
      console.error('Error deleting department:', error)
      toast.error(error.response?.data?.message || 'Failed to delete department')
    }
  }
  
  const handleSearch = (e) => {
    e.preventDefault()
    filterDepartments()
  }

  const openDetailsModal = async (department) => {
    setSelectedDepartment(department)
    setIsDetailsModalOpen(true)
    
    try {
      const response = await axios.get(`/api/departments/${department._id}/stats`)
      setDepartmentStats(response.data)
    } catch (error) {
      console.error('Error fetching department stats:', error)
      toast.error('Failed to load department statistics')
    }
  }

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false)
    setSelectedDepartment(null)
    setDepartmentStats(null)
  }

  const handleExport = async () => {
    try {
      const response = await axios.get('/api/departments/export')
      const csvData = response.data
      
      // Convert to CSV format
      const headers = Object.keys(csvData[0] || {})
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => 
          headers.map(header => `"${row[header] || ''}"`).join(',')
        )
      ].join('\n')
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `departments_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Departments data exported successfully')
    } catch (error) {
      console.error('Error exporting departments:', error)
      toast.error('Failed to export departments data')
    }
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Departments</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage departments for organizing users
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
          >
            <ArrowDownTrayIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" aria-hidden="true" />
            Export
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            disabled={refreshing}
          >
            <ArrowPathIcon className={`-ml-1 mr-2 h-5 w-5 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            type="button"
            onClick={() => openModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Department
          </button>
        </div>
      </div>
      
      {/* Search and Filter Bar */}
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
                placeholder="Search departments..."
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
            <div className="flex items-center text-sm text-gray-500">
              <FunnelIcon className="mr-1.5 h-5 w-5 text-gray-400" />
              <span className="font-medium text-gray-900">{allDepartments.length}</span>
              <span className="ml-1">total departments</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Departments List */}
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
            <p className="mt-2 text-gray-500">Loading departments...</p>
          </div>
        ) : departments.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {departments.map((department) => (
              <li key={department._id} className="hover:bg-gray-50 transition-colors duration-150">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 p-2 rounded-md bg-purple-100">
                        <BuildingOfficeIcon className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-purple-600">{department.name}</p>
                        {department.code && (
                          <p className="text-xs text-gray-500">Code: {department.code}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        <UsersIcon className="h-4 w-4 mr-1 text-gray-400" />
                        <span className="font-medium">{userCounts[department._id] || 0}</span>
                        <span className="ml-1">users</span>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex space-x-2">
                        <button
                          onClick={() => openDetailsModal(department)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => openModal(department)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(department._id)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  {department.description && (
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="text-sm text-gray-500">{department.description}</p>
                      </div>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-10">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No departments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? "No departments match your search criteria." 
                : "Get started by creating a new department."}
            </p>
            <div className="mt-6">
              {searchTerm ? (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <XMarkIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Clear Search
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => openModal()}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Add Department
                </button>
              )}
            </div>
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
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ChevronLeftIcon className="h-5 w-5 mr-1" />
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(page => Math.min(page + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Next
                <ChevronRightIcon className="h-5 w-5 ml-1" />
              </button>
            </div>
          </nav>
        )}
      </div>
      
      {/* Add/Edit Department Modal */}
      {isModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100">
                  <BuildingOfficeIcon className="h-6 w-6 text-purple-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {isEditMode ? 'Edit Department' : 'Add New Department'}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {isEditMode 
                      ? 'Update the department information below.' 
                      : 'Enter the details for the new department.'}
                  </p>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={departmentForm.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm border-gray-300 rounded-md"
                    placeholder="e.g. Computer Science"
                  />
                </div>
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                    Department Code
                  </label>
                  <input
                    type="text"
                    name="code"
                    id="code"
                    value={departmentForm.code}
                    onChange={handleInputChange}
                    className="mt-1 block w-full shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm border-gray-300 rounded-md"
                    placeholder="e.g. CS"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    A short code to identify this department
                  </p>
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={departmentForm.description}
                    onChange={handleInputChange}
                    className="mt-1 block w-full shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Brief description of the department"
                  />
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:col-start-2 sm:text-sm transition-colors"
                  >
                    {isEditMode ? 'Save Changes' : 'Create Department'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:col-start-1 sm:text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Department Details Modal */}
      {isDetailsModalOpen && selectedDepartment && (
        <div className="fixed z-20 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  onClick={closeDetailsModal}
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100">
                  <ChartBarIcon className="h-6 w-6 text-purple-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Department Details: {selectedDepartment.name}
                  </h3>
                  {selectedDepartment.code && (
                    <p className="text-sm text-gray-500">Code: {selectedDepartment.code}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-6">
                {/* Basic Information */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Basic Information</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <span className="text-sm text-gray-500">Name:</span>
                      <span className="ml-2 text-sm font-medium text-gray-900">{selectedDepartment.name}</span>
                    </div>
                    {selectedDepartment.code && (
                      <div>
                        <span className="text-sm text-gray-500">Code:</span>
                        <span className="ml-2 text-sm font-medium text-gray-900">{selectedDepartment.code}</span>
                      </div>
                    )}
                    {selectedDepartment.description && (
                      <div>
                        <span className="text-sm text-gray-500">Description:</span>
                        <span className="ml-2 text-sm text-gray-900">{selectedDepartment.description}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-sm text-gray-500">Status:</span>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedDepartment.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedDepartment.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Created:</span>
                      <span className="ml-2 text-sm text-gray-900">
                        {new Date(selectedDepartment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Statistics */}
                {departmentStats ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Statistics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-purple-600">{departmentStats.totalUsers}</div>
                        <div className="text-xs text-gray-500">Total Users</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-green-600">{departmentStats.activeUsers}</div>
                        <div className="text-xs text-gray-500">Active Users</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600">{departmentStats.attendanceStats.totalAttendance}</div>
                        <div className="text-xs text-gray-500">Attendance (30 days)</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-orange-600">{departmentStats.attendanceStats.uniqueUserCount}</div>
                        <div className="text-xs text-gray-500">Active Users (30 days)</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-600"></div>
                      <p className="mt-2 text-sm text-gray-500">Loading statistics...</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                <button
                  type="button"
                  onClick={closeDetailsModal}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:text-sm transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Departments