import { CheckCircle, XCircle, Calendar, Clock, User } from 'lucide-react'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'

const EventAttendeeList = ({ filteredAttendees, loading }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Not checked in'
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading attendees...</p>
        </div>
      </Card>
    )
  }

  if (filteredAttendees.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No attendees found</h3>
          <p className="mt-2 text-sm text-gray-600">
            No one has registered for this event yet.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Attendees ({filteredAttendees.length})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredAttendees.map((attendee) => (
            <div key={attendee._id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                  </Avatar>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {attendee.user?.name || attendee.userId?.name || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {attendee.user?.email || attendee.userId?.email || 'No email'}
                    </p>
                    {attendee.user?.registrationId && (
                      <p className="text-xs text-gray-500">
                        ID: {attendee.user.registrationId}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    {attendee.checkInTime ? (
                      <Badge variant="success" className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Checked In
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Not Checked In
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-1 justify-end">
                      <Calendar className="w-3 h-3" />
                      <span>Registered: {formatDate(attendee.registeredAt)}</span>
                    </div>
                    {attendee.checkInTime && (
                      <div className="flex items-center gap-1 justify-end mt-1">
                        <Clock className="w-3 h-3" />
                        <span>Checked in: {formatDate(attendee.checkInTime)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

export default EventAttendeeList
