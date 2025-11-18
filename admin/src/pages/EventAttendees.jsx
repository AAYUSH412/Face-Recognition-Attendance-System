import { useState, useEffect, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import { Button } from '../components/ui/Button'
import EventAttendeeStats from '../components/events/EventAttendeeStats'
import EventAttendeeFilters from '../components/events/EventAttendeeFilters'
import EventAttendeeList from '../components/events/EventAttendeeList'

const EventAttendees = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [attendees, setAttendees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showManualCheckIn, setShowManualCheckIn] = useState(false)
  const [availableUsers, setAvailableUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState('')
  const [addingAttendee, setAddingAttendee] = useState(false)
  const [filteredAttendees, setFilteredAttendees] = useState([])

  useEffect(() => {
    fetchEventData()
  }, [fetchEventData])

  useEffect(() => {
    filterAttendees()
  }, [filterAttendees])

  const fetchEventData = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch event details
      const eventResponse = await axios.get(`/api/events/${id}`)
      setEvent(eventResponse.data)

      // Fetch event attendees
      const attendeesResponse = await axios.get(`/api/events/${id}/attendees`)
      setAttendees(attendeesResponse.data)

      // Fetch available users for manual check-in
      const usersResponse = await axios.get('/api/users')
      setAvailableUsers(usersResponse.data)
    } catch (error) {
      console.error('Error fetching event data:', error)
      toast.error('Failed to load event data')
      if (error.response?.status === 404) {
        navigate('/events')
      }
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  const filterAttendees = useCallback(() => {
    if (!searchTerm.trim()) {
      setFilteredAttendees(attendees)
      return
    }

    const filtered = attendees.filter(attendee => {
      const user = attendee.user || attendee.userId
      if (!user) return false
      
      const searchLower = searchTerm.toLowerCase()
      return (
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.registrationId?.toLowerCase().includes(searchLower)
      )
    })
    
    setFilteredAttendees(filtered)
  }, [searchTerm, attendees])

  const handleManualCheckIn = async () => {
    if (!selectedUser) return

    setAddingAttendee(true)
    try {
      await axios.post(`/api/events/${id}/manual-checkin`, {
        userId: selectedUser
      })
      
      toast.success('User checked in successfully')
      setSelectedUser('')
      setShowManualCheckIn(false)
      fetchEventData() // Refresh data
    } catch (error) {
      console.error('Error checking in user:', error)
      toast.error(error.response?.data?.message || 'Failed to check in user')
    } finally {
      setAddingAttendee(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/events/${id}`}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Event
            </Link>
          </Button>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Event Attendees</h1>
          {event && (
            <p className="mt-2 text-gray-600">
              Attendees for "{event.name}"
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      {!loading && <EventAttendeeStats attendees={attendees} />}

      {/* Filters */}
      <EventAttendeeFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showManualCheckIn={showManualCheckIn}
        setShowManualCheckIn={setShowManualCheckIn}
        availableUsers={availableUsers}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        onManualCheckIn={handleManualCheckIn}
        addingAttendee={addingAttendee}
      />

      {/* Attendee List */}
      <EventAttendeeList
        filteredAttendees={filteredAttendees}
        loading={loading}
      />
    </div>
  )
}

export default EventAttendees
