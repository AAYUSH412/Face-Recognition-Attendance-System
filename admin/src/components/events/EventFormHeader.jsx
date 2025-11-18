import { ArrowLeft, Save, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'

const EventFormHeader = ({ isEditMode, saving, onSubmit, onCancel }) => {
  return (
    <div className="border-b border-gray-200 pb-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/events">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Events
            </Link>
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? 'Edit Event' : 'Create New Event'}
            </h1>
            <p className="mt-1 text-gray-600">
              {isEditMode 
                ? 'Update event details and settings' 
                : 'Fill in the details to create a new event'
              }
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={saving}
          >
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
          
          <Button
            onClick={onSubmit}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-1" />
            {saving ? 'Saving...' : (isEditMode ? 'Update Event' : 'Create Event')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default EventFormHeader
