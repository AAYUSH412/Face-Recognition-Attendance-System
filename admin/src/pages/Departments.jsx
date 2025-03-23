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
  UsersIcon
} from '@heroicons/react/24/outline'

const Departments = () => {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [departmentForm, setDepartmentForm] = useState({
    name: '',
    description: '',
    code: ''
  })
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null)
  const [userCounts, setUserCounts] = useState({})

  useEffect(() => {
    fetchDepartments()
  }, [currentPage])

  const fetchDepartments = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/departments')
      const departments = response.data
      
      // Simple pagination
      const itemsPerPage = 10
      const totalItems = departments.length
      const pages = Math.ceil(totalItems / itemsPerPage)
      
      setTotalPages(pages || 1)
      
      // Get current page items
      const startIndex = (currentPage - 1) * itemsPerPage
      const paginatedDepartments = departments.slice(startIndex, startIndex + itemsPerPage)
      
      setDepartments(paginatedDepartments)
      
      // Fetch user counts for each department
      const countPromises = paginatedDepartments.map(async (dept) => {
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
    } catch (error) {
      console.error('Error fetching departments:', error)
      toast.error('Failed to load departments')
    } finally {
      setLoading(false)
    }
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

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Departments</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage departments for organizing users
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
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
      
      {/* Departments List */}
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
            <p className="mt-2 text-gray-500">Loading departments...</p>
          </div>
        ) : departments.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {departments.map((department) => (
              <li key={department._id}>
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
                      <div className="text-sm text-gray-500">
                        {userCounts[department._id] || 0} users
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <button
                          onClick={() => openModal(department)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(department._id)}
                          className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">No departments</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new department.</p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => openModal()}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Add Department
              </button>
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
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {isEditMode ? 'Edit Department' : 'Add New Department'}
                  </h3>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="mt-5">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Department Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={departmentForm.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm border-gray-300 rounded-md"
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
                    />
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
                    />
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:col-start-2 sm:text-sm"
                  >
                    {isEditMode ? 'Save Changes' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Departments