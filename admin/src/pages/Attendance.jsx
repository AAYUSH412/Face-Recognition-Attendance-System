import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  CalendarIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline'

const Attendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date(new Date().setDate(new Date().getDate() - 30)), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  })
  const [filter, setFilter] = useState({
    status: '',
    verification: '',
    department: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [departments, setDepartments] = useState([])
  const [expandedRecord, setExpandedRecord] = useState(null)
  
  useEffect(() => {
    fetchAttendanceRecords()
    fetchDepartments()
  }, [currentPage, dateRange, filter])
  
  const fetchAttendanceRecords = async () => {
    setLoading(true)
    try {
      // In a real implementation, you would use query params for pagination and filtering
      const response = await axios.get(`/api/attendance?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`)
      
      // Filter data based on search term and filters
      let filteredRecords = response.data
      
      // Apply filters
      if (filter.status) {
        filteredRecords = filteredRecords.filter(record => record.status === filter.status)
      }
      
      if (filter.verification === 'verified') {
        filteredRecords = filteredRecords.filter(record => 
          (record.checkIn?.verified || !record.checkIn?.time) && 
          (record.checkOut?.verified || !record.checkOut?.time)
        )
      } else if (filter.verification === 'unverified') {
        filteredRecords = filteredRecords.filter(record => 
          (!record.checkIn?.verified && record.checkIn?.time) || 
          (!record.checkOut?.verified && record.checkOut?.time)
        )
      }
      
      if (filter.department) {
        filteredRecords = filteredRecords.filter(record => 
          record.user.department?._id === filter.department
        )
      }
      
      if (searchTerm) {
        filteredRecords = filteredRecords.filter(record => 
          record.user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          record.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.user.registrationId?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      
      // Simple pagination (client-side for demo)
      const itemsPerPage = 10
      const totalItems = filteredRecords.length
      const pages = Math.ceil(totalItems / itemsPerPage)
      
      setTotalPages(pages || 1)
      
      // Adjust current page if it's out of bounds after filtering
      const validPage = Math.min(currentPage, pages || 1)
      if (validPage !== currentPage) {
        setCurrentPage(validPage)
      }
      
      // Get current page items
      const startIndex = (validPage - 1) * itemsPerPage
      const paginatedRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage)
      
      setAttendanceRecords(paginatedRecords)
    } catch (error) {
      console.error('Error fetching attendance records:', error)
      toast.error('Failed to load attendance records')
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
    fetchAttendanceRecords()
  }
  
  const handleFilterChange = (name, value) => {
    setFilter(prev => ({ ...prev, [name]: value }))
    setCurrentPage(1) // Reset to first page on new filter
  }
  
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target
    setDateRange(prev => ({ ...prev, [name]: value }))
    setCurrentPage(1) // Reset to first page on new date range
  }
  
  const handleVerifyAttendance = async (recordId, type) => {
    try {
      await axios.patch(`/api/attendance/${recordId}/verify`, { type })
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} verified successfully`)
      
      // Update the record in the UI
      setAttendanceRecords(records => 
        records.map(record => {
          if (record._id === recordId) {
            return {
              ...record,
              [type]: {
                ...record[type],
                verified: true
              }
            }
          }
          return record
        })
      )
    } catch (error) {
      console.error(`Error verifying ${type}:`, error)
      toast.error(`Failed to verify ${type}`)
    }
  }
  
  const handleRejectAttendance = async (recordId, type) => {
    if (!window.confirm(`Are you sure you want to reject this ${type}?`)) return
    
    try {
      await axios.patch(`/api/attendance/${recordId}/reject`, { type })
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} rejected successfully`)
      
      // Update the record in the UI
      setAttendanceRecords(records => 
        records.map(record => {
          if (record._id === recordId) {
            return {
              ...record,
              [type]: {
                ...record[type],
                time: null,
                imageUrl: null,
                verified: false
              }
            }
          }
          return record
        })
      )
    } catch (error) {
      console.error(`Error rejecting ${type}:`, error)
      toast.error(`Failed to reject ${type}`)
    }
  }
  
  const exportToCSV = async () => {
    try {
      const response = await axios.get(`/api/attendance/export?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`, {
        responseType: 'blob'
      })
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `attendance_${dateRange.startDate}_to_${dateRange.endDate}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Attendance exported successfully')
    } catch (error) {
      console.error('Error exporting attendance:', error)
      toast.error('Failed to export attendance')
    }
  }
  
  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800'
      case 'late':
        return 'bg-yellow-100 text-yellow-800'
      case 'absent':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Attendance Records</h1>
          <p className="mt-2 text-sm text-gray-700">
            View and manage attendance records for all users
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            onClick={exportToCSV}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <DocumentArrowDownIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Export to CSV
          </button>
        </div>
      </div>
      
      <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:space-x-4">
            <div className="w-full md:w-1/4">
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                <CalendarIcon className="h-4 w-4 inline mr-1" />
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateRangeChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
              />
            </div>
            <div className="w-full md:w-1/4 mt-4 md:mt-0">
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                <CalendarIcon className="h-4 w-4 inline mr-1" />
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateRangeChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
              />
            </div>
            <div className="w-full md:w-1/2 mt-4 md:mt-0">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                <MagnifyingGlassIcon className="h-4 w-4 inline mr-1" />
                Search
              </label>
              <form onSubmit={handleSearch} className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="focus:ring-purple-500 focus:border-purple-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search by name, email, or ID..."
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
          </div>
          
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium text-gray-700">Status Filter</label>
              <div className="mt-1 flex space-x-2">
                <button
                  type="button"
                  onClick={() => handleFilterChange('status', '')}
                  className={`inline-flex items-center px-3 py-1.5 border ${
                    filter.status === '' ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-300 text-gray-700 bg-white'
                  } text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => handleFilterChange('status', 'present')}
                  className={`inline-flex items-center px-3 py-1.5 border ${
                    filter.status === 'present' ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-300 text-gray-700 bg-white'
                  } text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
                >
                  Present
                </button>
                <button
                  type="button"
                  onClick={() => handleFilterChange('status', 'late')}
                  className={`inline-flex items-center px-3 py-1.5 border ${
                    filter.status === 'late' ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-300 text-gray-700 bg-white'
                  } text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
                >
                  Late
                </button>
                <button
                  type="button"
                  onClick={() => handleFilterChange('status', 'absent')}
                  className={`inline-flex items-center px-3 py-1.5 border ${
                    filter.status === 'absent' ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-300 text-gray-700 bg-white'
                  } text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
                >
                  Absent
                </button>
              </div>
            </div>
            
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium text-gray-700">Verification Filter</label>
              <div className="mt-1 flex space-x-2">
                <button
                  type="button"
                  onClick={() => handleFilterChange('verification', '')}
                  className={`inline-flex items-center px-3 py-1.5 border ${
                    filter.verification === '' ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-300 text-gray-700 bg-white'
                  } text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => handleFilterChange('verification', 'verified')}
                  className={`inline-flex items-center px-3 py-1.5 border ${
                    filter.verification === 'verified' ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-300 text-gray-700 bg-white'
                  } text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
                >
                  Verified
                </button>
                <button
                  type="button"
                  onClick={() => handleFilterChange('verification', 'unverified')}
                  className={`inline-flex items-center px-3 py-1.5 border ${
                    filter.verification === 'unverified' ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-300 text-gray-700 bg-white'
                  } text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
                >
                  Pending
                </button>
              </div>
            </div>
            
            <div className="w-full md:w-1/3">
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
              <select
                id="department"
                name="department"
                value={filter.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setFilter({ status: '', verification: '', department: '' });
                setSearchTerm('');
                setDateRange({
                  startDate: format(new Date(new Date().setDate(new Date().getDate() - 30)), 'yyyy-MM-dd'),
                  endDate: format(new Date(), 'yyyy-MM-dd')
                });
              }}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <ArrowPathIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
              Reset Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Attendance List */}
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
            <p className="mt-2 text-gray-500">Loading attendance records...</p>
          </div>
        ) : attendanceRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceRecords.map((record) => (
                  <tr 
                    key={record._id} 
                    className={expandedRecord === record._id ? 'bg-purple-50' : 'hover:bg-gray-50'}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium">
                            {record.user?.name.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{record.user?.name}</div>
                          <div className="text-sm text-gray-500">{record.user?.email}</div>
                          <div className="text-xs text-gray-500 capitalize">{record.user?.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.checkIn?.time ? (
                        <div className="flex items-center">
                          {record.checkIn.verified ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-1.5" />
                          ) : (
                            <XCircleIcon className="h-5 w-5 text-yellow-500 mr-1.5" />
                          )}
                          <span className="text-sm text-gray-900">
                            {new Date(record.checkIn.time).toLocaleTimeString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">--</span>
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
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClasses(record.status)}`}>
                        {record.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        type="button"
                        onClick={() => setExpandedRecord(expandedRecord === record._id ? null : record._id)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        {expandedRecord === record._id ? 'Hide Details' : 'View Details'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No attendance records found matching your criteria</p>
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
    </div>
  )
}

export default Attendance