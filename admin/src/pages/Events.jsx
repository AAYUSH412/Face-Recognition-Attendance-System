import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import EventStats from '../components/events/EventStats'
import EventFilters from '../components/events/EventFilters'
import EventList from '../components/events/EventList'

const Events = () => {
  const [events, setEvents] = useState([])
  const [allEvents, setAllEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState('all') // all, upcoming, past, today

  const fetchEvents = useCallback(async () => {
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
  }, [currentPage, filter, searchTerm])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Events</h1>
        <p className="mt-2 text-gray-600">
          Manage events and track attendance for each event
        </p>
      </div>

      {/* Stats */}
      <EventStats allEvents={allEvents} />

      {/* Filters */}
      <EventFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleSearch={handleSearch}
        filter={filter}
        handleFilterChange={handleFilterChange}
        refreshing={refreshing}
        handleRefresh={handleRefresh}
        allEvents={allEvents}
      />

      {/* Event List */}
      <EventList
        events={events}
        loading={loading}
        handleDelete={handleDelete}
        regenerateQRCode={regenerateQRCode}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </div>
  )
}

export default Events