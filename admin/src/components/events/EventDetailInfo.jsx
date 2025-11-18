import { Calendar, MapPin, Users, QrCode, Edit, Trash2, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import { QRCodeSVG } from 'qrcode.react'

const EventDetailInfo = ({ 
  event, 
  attendeeCount, 
  onDelete, 
  onRegenerateQR, 
  showQR, 
  setShowQR, 
  regeneratingQR 
}) => {
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Event Information */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
                {event.description && (
                  <p className="mt-2 text-gray-600">{event.description}</p>
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

            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Edit className="w-4 h-4 mr-1" />
                <Link to={`/events/${event._id}/edit`}>
                  
                  Edit
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={onDelete}
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </Card>

        {/* Event Details */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Start Date</p>
                <p className="text-sm text-gray-600">{formatDate(event.startDate)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">End Date</p>
                <p className="text-sm text-gray-600">{formatDate(event.endDate)}</p>
              </div>
            </div>
            
            {event.location && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Location</p>
                  <p className="text-sm text-gray-600">{event.location}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Attendees</p>
                <p className="text-sm text-gray-600">{attendeeCount} registered</p>
              </div>
            </div>

            {event.department && (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-gray-400 rounded" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Department</p>
                  <p className="text-sm text-gray-600">
                    {typeof event.department === 'object' ? event.department.name : event.department}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* QR Code Section */}
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">QR Code</h2>
          
          <div className="text-center">
            {showQR && event.qrCode ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <QRCodeSVG 
                    value={event.qrCode} 
                    size={200}
                    level="M"
                    includeMargin={true}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Scan this QR code to check in to the event
                </p>
              </div>
            ) : (
              <div className="py-8">
                <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  {event.qrCode ? 'Click to show QR code' : 'No QR code available'}
                </p>
              </div>
            )}
            
            <div className="flex flex-col gap-2 mt-4">
              {event.qrCode && (
                <Button
                  variant="outline"
                  onClick={() => setShowQR(!showQR)}
                  className="w-full"
                >
                  <QrCode className="w-4 h-4 mr-1" />
                  {showQR ? 'Hide QR Code' : 'Show QR Code'}
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={onRegenerateQR}
                disabled={regeneratingQR}
                className="w-full"
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${regeneratingQR ? 'animate-spin' : ''}`} />
                {regeneratingQR ? 'Generating...' : 'Regenerate QR'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          
          <div className="space-y-3">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Users className="w-4 h-4 mr-1" />
              <Link to={`/events/${event._id}/attendees`}>
                
                View Attendees ({attendeeCount})
              </Link>
            </Button>
            
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to="/events">
                Back to Events
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default EventDetailInfo
