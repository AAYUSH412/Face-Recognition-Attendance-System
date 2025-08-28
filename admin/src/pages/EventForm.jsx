import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import EventFormHeader from '../components/events/EventFormHeader'
import EventFormFields from '../components/events/EventFormFields'
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton'

const EventForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = !!id
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [departments, setDepartments] = useState([])
  const [users, setUsers] = useState([])

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    department: '',
    attendeeType: 'all',
    eligibleDepartments: [],
    eligibleUsers: [],
    isActive: true
  })

  // Format date for input fields
  const formatDateForInput = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toISOString().slice(0, 16)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [departmentsResponse, usersResponse] = await Promise.all([
          axios.get('/api/departments'),
          axios.get('/api/users')
        ])
        
        setDepartments(departmentsResponse.data)
        setUsers(usersResponse.data)

        // If edit mode, fetch event details
        if (isEditMode) {
          setLoading(true)
          try {
            const eventResponse = await axios.get(`/api/events/${id}`)
            const event = eventResponse.data
            
            setFormData({
              name: event.name || '',
              description: event.description || '',
              startDate: formatDateForInput(event.startDate) || '',
              endDate: formatDateForInput(event.endDate) || '',
              location: event.location || '',
              department: event.department?._id || '',
              attendeeType: event.attendeeType || 'all',
              eligibleDepartments: event.eligibleDepartments?.map(dept => dept._id || dept) || [],
              eligibleUsers: event.eligibleUsers?.map(user => user._id || user) || [],
              isActive: event.isActive !== undefined ? event.isActive : true
            })
          } catch (error) {
            console.error('Error fetching event details:', error)
            toast.error('Failed to load event details')
            if (error.response?.status === 404) {
              navigate('/events')
            }
          } finally {
            setLoading(false)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load form data')
      }
    }

    fetchData()
  }, [id, isEditMode, navigate])

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Event name is required')
      return false
    }
    
    if (!formData.startDate) {
      toast.error('Start date is required')
      return false
    }
    
    if (!formData.endDate) {
      toast.error('End date is required')
      return false
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error('End date must be after start date')
      return false
    }

    if (formData.attendeeType === 'department' && formData.eligibleDepartments.length === 0) {
      toast.error('Please select at least one department')
      return false
    }

    if (formData.attendeeType === 'specific' && formData.eligibleUsers.length === 0) {
      toast.error('Please select at least one user')
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setSaving(true)
    try {
      const eventData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      }

      if (isEditMode) {
        await axios.put(`/api/events/${id}`, eventData)
        toast.success('Event updated successfully')
      } else {
        await axios.post('/api/events', eventData)
        toast.success('Event created successfully')
      }
      
      navigate('/events')
    } catch (error) {
      console.error('Error saving event:', error)
      toast.error(error.response?.data?.message || 'Failed to save event')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    navigate(isEditMode ? `/events/${id}` : '/events')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-16" />
        <LoadingSkeleton className="h-96" />
        <LoadingSkeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <EventFormHeader
        isEditMode={isEditMode}
        saving={saving}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />

      <EventFormFields
        formData={formData}
        setFormData={setFormData}
        departments={departments}
        users={users}
      />
    </div>
  )
}

export default EventForm
