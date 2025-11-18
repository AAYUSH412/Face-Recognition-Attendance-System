import { Calendar, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
import EventCard from './EventCard'
import { LoadingSkeleton } from '../ui/LoadingSkeleton'

const EventList = ({ 
  events, 
  loading, 
  handleDelete, 
  regenerateQRCode, 
  currentPage, 
  totalPages, 
  setCurrentPage 
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <LoadingSkeleton key={i} className="h-32" />
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center">
          <div className="p-4 bg-gray-100 rounded-full">
            <Calendar className="w-12 h-12 text-gray-400" />
          </div>
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No events found</h3>
        <p className="mt-2 text-sm text-gray-600">
          Get started by creating a new event.
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link to="/events/new" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Event
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Event Cards */}
      {events.map((event) => (
        <EventCard
          key={event._id}
          event={event}
          handleDelete={handleDelete}
          regenerateQRCode={regenerateQRCode}
        />
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="text-sm text-gray-600">
            Page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(page => Math.min(page + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default EventList
