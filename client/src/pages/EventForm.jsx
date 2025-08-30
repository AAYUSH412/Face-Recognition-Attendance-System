import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
import { 
  CalendarIcon, 
  MapPinIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ArrowLeftIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const EventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    department: '',
    attendeeType: 'all',
    eligibleDepartments: [],
    eligibleUsers: [],
    isActive: true
  });

  const [errors, setErrors] = useState({});

  // Format date for input fields
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  useEffect(() => {
    // Check if user has permission to create/edit events
    if (currentUser?.role !== 'admin' && currentUser?.role !== 'faculty') {
      toast.error('You do not have permission to access this page');
      navigate('/events');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [departmentsResponse, usersResponse] = await Promise.all([
          api.get('/api/departments'),
          api.get('/api/users')
        ]);
        
        setDepartments(departmentsResponse.data);
        setUsers(usersResponse.data);

        // If edit mode, fetch event details
        if (isEditMode) {
          const eventResponse = await api.get(`/api/events/${id}`);
          const event = eventResponse.data;
          
          setFormData({
            name: event.name || '',
            description: event.description || '',
            startDate: formatDateForInput(event.startDate),
            endDate: formatDateForInput(event.endDate),
            location: event.location || '',
            department: event.department?._id || '',
            attendeeType: event.attendeeType || 'all',
            eligibleDepartments: event.eligibleDepartments?.map(dept => dept._id) || [],
            eligibleUsers: event.eligibleUsers?.map(user => user._id) || [],
            isActive: event.isActive !== undefined ? event.isActive : true
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load form data');
        if (isEditMode && error.response?.status === 404) {
          navigate('/events');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, currentUser, navigate, isEditMode]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (startDate >= endDate) {
        newErrors.endDate = 'End date must be after start date';
      }

      if (startDate < new Date()) {
        newErrors.startDate = 'Start date cannot be in the past';
      }
    }

    if (formData.attendeeType === 'department' && formData.eligibleDepartments.length === 0) {
      newErrors.eligibleDepartments = 'Please select at least one department';
    }

    if (formData.attendeeType === 'specific' && formData.eligibleUsers.length === 0) {
      newErrors.eligibleUsers = 'Please select at least one user';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleMultiSelect = (name, value) => {
    setFormData(prev => {
      const currentValues = prev[name];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(item => item !== value)
        : [...currentValues, value];
      
      return {
        ...prev,
        [name]: newValues
      };
    });

    // Clear error when user makes selection
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setSaving(true);
    try {
      const eventData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      };

      if (isEditMode) {
        await api.put(`/api/events/${id}`, eventData);
        toast.success('Event updated successfully');
      } else {
        await api.post('/api/events', eventData);
        toast.success('Event created successfully');
      }
      
      navigate('/events');
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(error.response?.data?.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/events')}
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Events
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <CalendarIcon className="h-8 w-8 mr-3 text-indigo-600" />
            {isEditMode ? 'Edit Event' : 'Create New Event'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isEditMode ? 'Update event details and settings' : 'Fill in the details to create a new event'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white shadow-lg rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                    errors.name ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter event name"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Enter event description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                    errors.startDate ? 'border-red-500' : ''
                  }`}
                />
                {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                    errors.endDate ? 'border-red-500' : ''
                  }`}
                />
                {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Enter event location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Attendee Configuration */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <UserGroupIcon className="h-5 w-5 mr-2 text-indigo-600" />
                Attendee Configuration
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Who can attend this event?
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
                      All users
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
                      Specific departments
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
                      Specific users
                    </label>
                  </div>
                </div>

                {formData.attendeeType === 'department' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Departments *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                      {departments.map(dept => (
                        <label key={dept._id} className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={formData.eligibleDepartments.includes(dept._id)}
                            onChange={() => handleMultiSelect('eligibleDepartments', dept._id)}
                            className="mr-2"
                          />
                          {dept.name}
                        </label>
                      ))}
                    </div>
                    {errors.eligibleDepartments && (
                      <p className="mt-1 text-sm text-red-600">{errors.eligibleDepartments}</p>
                    )}
                  </div>
                )}

                {formData.attendeeType === 'specific' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Users *
                    </label>
                    <div className="max-h-60 overflow-y-auto border rounded-md p-3 space-y-2">
                      {users.map(user => (
                        <label key={user._id} className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={formData.eligibleUsers.includes(user._id)}
                            onChange={() => handleMultiSelect('eligibleUsers', user._id)}
                            className="mr-2"
                          />
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-gray-500">{user.email}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                    {errors.eligibleUsers && (
                      <p className="mt-1 text-sm text-red-600">{errors.eligibleUsers}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Event Status */}
            <div className="border-t pt-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">
                  Event is active (users can check in)
                </label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="border-t pt-6 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/events')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <XMarkIcon className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4 mr-2" />
                    {isEditMode ? 'Update Event' : 'Create Event'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventForm;
