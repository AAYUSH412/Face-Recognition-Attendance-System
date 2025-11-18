import { Users, UserCheck, UserX, Clock, Calendar } from 'lucide-react'
import { Card } from '../ui/Card'

const EventAttendeeStats = ({ attendees }) => {
  const checkedInCount = attendees.filter(attendee => attendee.checkInTime).length
  const notCheckedInCount = attendees.length - checkedInCount
  
  const stats = [
    {
      name: 'Total Registered',
      value: attendees.length,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      name: 'Checked In',
      value: checkedInCount,
      icon: UserCheck,
      color: 'bg-green-500'
    },
    {
      name: 'Not Checked In',
      value: notCheckedInCount,
      icon: UserX,
      color: 'bg-orange-500'
    },
    {
      name: 'Attendance Rate',
      value: attendees.length > 0 ? `${Math.round((checkedInCount / attendees.length) * 100)}%` : '0%',
      icon: Clock,
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <Card key={stat.name} className="p-6">
          <div className="flex items-center">
            <div className={`${stat.color} p-3 rounded-lg`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export default EventAttendeeStats
