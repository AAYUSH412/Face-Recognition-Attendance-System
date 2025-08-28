import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import EventDetailInfo from '../components/events/EventDetailInfo'
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton'

const EventDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [regeneratingQR, setRegeneratingQR] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [attendeeCount, setAttendeeCount] = useState(0)

  const fetchEventData = useCallback(async () => {
    setLoading(true)
    try {
      const eventResponse = await axios.get(`/api/events/${id}`)
      setEvent(eventResponse.data)

      // Fetch attendee count
      const attendeesResponse = await axios.get(`/api/events/${id}/attendees`)
      setAttendeeCount(attendeesResponse.data.length)
    } catch (error) {
      console.error('Error fetching event details:', error)
      toast.error('Failed to load event details')
      if (error.response?.status === 404) {
        navigate('/events')
      }
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => {
    fetchEventData()
  }, [fetchEventData])

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event? All attendance records for this event will also be deleted.')) {
      return
    }
    
    try {
      await axios.delete(`/api/events/${id}`)
      toast.success('Event deleted successfully')
      navigate('/events')
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error(error.response?.data?.message || 'Failed to delete event')
    }
  }

  const handleRegenerateQR = async () => {
    setRegeneratingQR(true)
    try {
      await axios.post(`/api/events/${id}/regenerate-qr`)
      toast.success('QR Code regenerated successfully')
      fetchEventData() // Refresh event data to get new QR code
    } catch (error) {
      console.error('Error regenerating QR code:', error)
      toast.error(error.response?.data?.message || 'Failed to regenerate QR code')
    } finally {
      setRegeneratingQR(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-16" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <LoadingSkeleton className="h-64" />
            <LoadingSkeleton className="h-48" />
          </div>
          <div className="space-y-6">
            <LoadingSkeleton className="h-80" />
            <LoadingSkeleton className="h-32" />
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Event not found</h3>
        <p className="mt-2 text-sm text-gray-600">
          The event you're looking for doesn't exist or has been deleted.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <EventDetailInfo
        event={event}
        attendeeCount={attendeeCount}
        onDelete={handleDelete}
        onRegenerateQR={handleRegenerateQR}
        showQR={showQR}
        setShowQR={setShowQR}
        regeneratingQR={regeneratingQR}
      />
    </div>
  )
}

export default EventDetail
