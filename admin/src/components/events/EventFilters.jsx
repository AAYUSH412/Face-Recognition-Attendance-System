import { Search, RefreshCw, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card } from '../ui/Card'

const EventFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  handleSearch, 
  filter, 
  handleFilterChange, 
  refreshing, 
  handleRefresh,
  allEvents 
}) => {
  const filterOptions = [
    { key: 'all', label: 'All Events' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'today', label: 'Today' },
    { key: 'past', label: 'Past' }
  ]

  return (
    <Card className="p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Search Section */}
        <div className="flex-1 max-w-md">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search events..."
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
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium text-gray-900">{allEvents.length}</span>
            <span className="ml-1">total events</span>
          </div>
          
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>

          <Button asChild>
            <Link to="/events/new" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Event
            </Link>
          </Button>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mt-4">
        {filterOptions.map((option) => (
          <Button
            key={option.key}
            variant={filter === option.key ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange(option.key)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </Card>
  )
}

export default EventFilters
