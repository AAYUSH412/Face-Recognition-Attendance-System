import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  PencilIcon,
  TrashIcon,
  QrCodeIcon,
  UserGroupIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'

const Events = () => {
  const [events, setEvents] = useState([])
  const [allEvents, setAllEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [refreshing, setRefreshing] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filter, setFilter] = useState('all') // all, upcoming, past, today
  const [departments, setDepartments] = useState([])

  useEffect(() => {
    fetchEvents()
    fetchDepartments()
  }, [currentPage, filter])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      // Build query parameters
      let query = ''
      if (filter === 'upcoming') query = '?upcoming=true'
      else if (filter === 'past') query = '?past=true'
      else if (filter === 'today') query = '?today=true'

      const response = await axios.get(`/api/events${query}`)
      setAllEvents(response.data)
      
      // Simple client-side pagination
      const itemsPerPage = 10
      const totalItems = response.data.length
      const pages = Math.ceil(totalItems / itemsPerPage)
      setTotalPages(pages || 1)
      
      // Filter by search term if any
      let filteredEvents = response.data
      if (searchTerm.trim()) {
        filteredEvents = filteredEvents.filter(event => 
          event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      }
      
      // Get current page items
      const startIndex = (currentPage - 1) * itemsPerPage
      const paginatedEvents = filteredEvents.slice(startIndex, startIndex + itemsPerPage)
      
      setEvents(paginatedEvents)
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('Failed to load events')
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

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchEvents()
    setRefreshing(false)
  }

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1) // Reset to first page on search
    fetchEvents()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event? All attendance records for this event will also be deleted.')) {
      return
    }
    
    try {
      await axios.delete(`/api/events/${id}`)
      toast.success('Event deleted successfully')
      fetchEvents()
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error(error.response?.data?.message || 'Failed to delete event')
    }
  }

  const regenerateQRCode = async (id) => {
    try {
      await axios.post(`/api/events/${id}/regenerate-qr`)
      toast.success('QR Code regenerated successfully')
      fetchEvents()
    } catch (error) {
      console.error('Error regenerating QR code:', error)
      toast.error(error.response?.data?.message || 'Failed to regenerate QR code')
    }
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Events</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage events and track attendance for each event
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            disabled={refreshing}
          >
            <ArrowPathIcon className={`-ml-1 mr-2 h-5 w-5 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <Link
            to="/events/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Create Event
          </Link>
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
                placeholder="Search events..."
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
              <span className="font-medium text-gray-900">{allEvents.length}</span>
              <span className="ml-1">total events</span>
            </div>
          </div>
        </div>
        
        {/* Filter buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleFilterChange('all')}
            className={`inline-flex items-center px-3 py-1.5 border ${
              filter === 'all' ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-300 text-gray-700 bg-white'
            } text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
          >
            All Events
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange('upcoming')}
            className={`inline-flex items-center px-3 py-1.5 border ${
              filter === 'upcoming' ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-300 text-gray-700 bg-white'
            } text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
          >
            Upcoming
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange('today')}
            className={`inline-flex items-center px-3 py-1.5 border ${
              filter === 'today' ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-300 text-gray-700 bg-white'
            } text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange('past')}
            className={`inline-flex items-center px-3 py-1.5 border ${
              filter === 'past' ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-300 text-gray-700 bg-white'
            } text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
          >
            Past
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-500">Loading events...</p>
          </div>
        ) : events.length > 0 ? (
          <div className="overflow-x-auto">
            <ul className="divide-y divide-gray-200">
              {events.map((event) => (
                <li key={event._id} className="hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <CalendarIcon className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <Link to={`/events/${event._id}`} className="text-sm font-medium text-purple-600 hover:text-purple-800">
                            {event.name}
                          </Link>
                          <p className="text-sm text-gray-500 flex flex-wrap items-center gap-x-3 mt-1">
                            <span className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                              {formatDate(event.startDate)} - {formatDate(event.endDate)}
                            </span>
                            {event.location && (
                              <span className="flex items-center">
                                <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
                                {event.location}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          to={`/events/${event._id}/attendees`}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                        >
                          <UserGroupIcon className="h-4 w-4 mr-1" />
                          Attendees
                        </Link>
                        <button
                          onClick={() => regenerateQRCode(event._id)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-indigo-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                          <QrCodeIcon className="h-4 w-4 mr-1" />
                          Regenerate QR
                        </button>
                        <Link
                          to={`/events/${event._id}/edit`}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(event._id)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                    {event.description && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 line-clamp-2">{event.description}</p>
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`px-2 py-1 inline-flex text-xs leading-4 font-medium rounded-full ${
                        new Date(event.endDate) < new Date() ? 'bg-gray-100 text-gray-800' :
                        new Date(event.startDate) > new Date() ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {new Date(event.endDate) < new Date() ? 'Completed' :
                         new Date(event.startDate) > new Date() ? 'Upcoming' : 'Active'}
                      </span>
                      <span className={`px-2 py-1 inline-flex text-xs leading-4 font-medium rounded-full ${
                        event.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {event.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-2 py-1 inline-flex text-xs leading-4 font-medium rounded-full bg-purple-100 text-purple-800">
                        {event.attendeeType === 'all' ? 'Open to All' :
                         event.attendeeType === 'department' ? 'Department Specific' :
                         'Invitation Only'}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-10">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new event.
            </p>
            <div className="mt-6">
              <Link
                to="/events/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Create Event
              </Link>
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
    </div>
  )
}

export default Events