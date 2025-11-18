import { Calendar, MapPin, Users, FileText, Save, X } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'

const EventFormFields = ({ 
  formData, 
  setFormData, 
  departments, 
  users
}) => {
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleMultiSelectChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Basic Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Name *
            </label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter event name"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter event description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter location"
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Date & Time */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Date & Time</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date & Time *
            </label>
            <Input
              type="datetime-local"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date & Time *
            </label>
            <Input
              type="datetime-local"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
      </Card>

      {/* Attendee Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Attendee Settings</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Who can attend? *
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="attendeeType"
                  value="all"
                  checked={formData.attendeeType === 'all'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm">Open to All Users</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="attendeeType"
                  value="department"
                  checked={formData.attendeeType === 'department'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm">Specific Departments</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="attendeeType"
                  value="specific"
                  checked={formData.attendeeType === 'specific'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm">Specific Users</span>
              </label>
            </div>
          </div>

          {formData.attendeeType === 'department' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Departments
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {departments.map((dept) => (
                  <label key={dept._id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.eligibleDepartments.includes(dept._id)}
                      onChange={(e) => {
                        const isChecked = e.target.checked
                        const newDepartments = isChecked
                          ? [...formData.eligibleDepartments, dept._id]
                          : formData.eligibleDepartments.filter(id => id !== dept._id)
                        handleMultiSelectChange('eligibleDepartments', newDepartments)
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{dept.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {formData.attendeeType === 'specific' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Users
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {users.map((user) => (
                  <label key={user._id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.eligibleUsers.includes(user._id)}
                      onChange={(e) => {
                        const isChecked = e.target.checked
                        const newUsers = isChecked
                          ? [...formData.eligibleUsers, user._id]
                          : formData.eligibleUsers.filter(id => id !== user._id)
                        handleMultiSelectChange('eligibleUsers', newUsers)
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{user.name} ({user.email})</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label className="text-sm font-medium text-gray-700">
              Event is Active
            </label>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default EventFormFields
