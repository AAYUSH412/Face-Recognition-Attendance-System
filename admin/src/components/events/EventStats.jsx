import { Calendar, Clock, Users, MapPin } from 'lucide-react'
import { Card } from '../ui/Card'

const EventStats = ({ allEvents }) => {
  // Calculate stats
  const now = new Date()
  const totalEvents = allEvents.length
  const upcomingEvents = allEvents.filter(event => new Date(event.startDate) > now).length
  const activeEvents = allEvents.filter(event => 
    new Date(event.startDate) <= now && new Date(event.endDate) >= now
  ).length
  const completedEvents = allEvents.filter(event => new Date(event.endDate) < now).length

  const stats = [
    {
      name: 'Total Events',
      value: totalEvents,
      icon: Calendar,
      color: 'bg-blue-500'
    },
    {
      name: 'Upcoming',
      value: upcomingEvents,
      icon: Clock,
      color: 'bg-green-500'
    },
    {
      name: 'Active Now',
      value: activeEvents,
      icon: Users,
      color: 'bg-orange-500'
    },
    {
      name: 'Completed',
      value: completedEvents,
      icon: MapPin,
      color: 'bg-gray-500'
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

export default EventStats
