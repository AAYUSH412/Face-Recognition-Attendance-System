import { CheckCircle, XCircle, Calendar, Clock, MapPin } from 'lucide-react'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'

const UserAttendanceHistory = ({ recentAttendance }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A'
    const options = { 
      hour: '2-digit', 
      minute: '2-digit' 
    }
    return new Date(dateString).toLocaleTimeString(undefined, options)
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Attendance (Last 30 Days)</h2>
      
      {recentAttendance.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-sm font-medium text-gray-900">No attendance records</h3>
          <p className="mt-1 text-sm text-gray-600">
            No attendance records found for the last 30 days.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {recentAttendance.map((record) => (
            <div 
              key={record._id} 
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${
                  record.status === 'present' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {record.status === 'present' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(record.date)}
                    </p>
                    <Badge variant={record.status === 'present' ? 'success' : 'destructive'}>
                      {record.status === 'present' ? 'Present' : 'Absent'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    {record.checkInTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        In: {formatTime(record.checkInTime)}
                      </span>
                    )}
                    {record.checkOutTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Out: {formatTime(record.checkOutTime)}
                      </span>
                    )}
                    {record.event && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {typeof record.event === 'object' ? record.event.name : record.event}
                      </span>
                    )}
                    {record.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {record.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {record.duration && (
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {Math.round(record.duration / 60)} min
                  </p>
                  <p className="text-xs text-gray-600">Duration</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

export default UserAttendanceHistory
