import { Search, Download, UserPlus, QrCode } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card } from '../ui/Card'

const EventAttendeeFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  showManualCheckIn, 
  setShowManualCheckIn,
  availableUsers,
  selectedUser,
  setSelectedUser,
  onManualCheckIn,
  addingAttendee 
}) => {
  const handleSearch = (e) => {
    e.preventDefault()
    // Search is handled in parent component via useEffect
  }

  const exportAttendees = () => {
    // This would be implemented to export attendee data
    console.log('Export attendees functionality')
  }

  return (
    <Card className="p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search attendees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
            <button
              type="submit"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <Search className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          </form>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={exportAttendees}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowManualCheckIn(!showManualCheckIn)}
            className="flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Manual Check-in
          </Button>
        </div>
      </div>

      {/* Manual Check-in Section */}
      {showManualCheckIn && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Manual Check-in</h3>
          <div className="flex gap-3">
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a user to check in...</option>
              {availableUsers.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            
            <Button
              onClick={onManualCheckIn}
              disabled={!selectedUser || addingAttendee}
            >
              <QrCode className="w-4 h-4 mr-1" />
              {addingAttendee ? 'Adding...' : 'Check In'}
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

export default EventAttendeeFilters
