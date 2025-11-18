import { Calendar, MapPin, Users, QrCode, Edit, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'

const EventCard = ({ event, handleDelete, regenerateQRCode }) => {
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const getEventStatus = () => {
    const now = new Date()
    const startDate = new Date(event.startDate)
    const endDate = new Date(event.endDate)

    if (endDate < now) return { label: 'Completed', variant: 'secondary' }
    if (startDate > now) return { label: 'Upcoming', variant: 'default' }
    return { label: 'Active', variant: 'success' }
  }

  const getAttendeeTypeLabel = () => {
    switch (event.attendeeType) {
      case 'all': return 'Open to All'
      case 'department': return 'Department Specific'
      default: return 'Invitation Only'
    }
  }

  const status = getEventStatus()

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <Link 
                  to={`/events/${event._id}`} 
                  className="text-lg font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {event.name}
                </Link>
                
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(event.startDate)} - {formatDate(event.endDate)}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </span>
                  )}
                </div>

                {event.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {event.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant={status.variant}>{status.label}</Badge>
                  <Badge variant={event.isActive ? 'success' : 'destructive'}>
                    {event.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="outline">
                    {getAttendeeTypeLabel()}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 ml-4">
          <Button variant="outline" size="sm" asChild>
            <Users className="w-4 h-4 mr-1" />
            <Link to={`/events/${event._id}/attendees`}>
              
              Attendees
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => regenerateQRCode(event._id)}
          >
            <QrCode className="w-4 h-4 mr-1" />
            QR Code
          </Button>
          
          <Button variant="outline" size="sm" asChild>
            <Edit className="w-4 h-4 mr-1" />
            <Link to={`/events/${event._id}/edit`}>
              
              Edit
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleDelete(event._id)}
            className="text-red-600 hover:text-red-800 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default EventCard
