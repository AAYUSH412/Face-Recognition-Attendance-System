import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  ArrowLeftIcon, 
  CalendarIcon, 
  MapPinIcon, 
  BuildingOfficeIcon,
  UserGroupIcon,
  UserIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const EventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

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

  // Format date for input fields
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('/api/departments');
        setDepartments(response.data);
      } catch (error) {
        console.error('Error fetching departments:', error);
        toast.error('Failed to load departments');
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      }
    };

    const fetchEventDetails = async () => {
      if (!isEditMode) return;
      
      setLoading(true);
      try {
        const response = await axios.get(`/api/events/${id}`);
        const event = response.data;
        
        // Format dates for form inputs
        setFormData({
          name: event.name || '',
          description: event.description || '',
          startDate: formatDateForInput(event.startDate) || '',
          endDate: formatDateForInput(event.endDate) || '',
          location: event.location || '',
          department: event.department?._id || '',
          attendeeType: event.attendeeType || 'all',
          eligibleDepartments: event.eligibleDepartments?.map(dept => dept._id || dept) || [],
          eligibleUsers: event.eligibleUsers?.map(user => user._id || user) || [],
          isActive: event.isActive !== undefined ? event.isActive : true
        });

        // If we have eligible users, set them for the multi-select
        if (event.eligibleUsers?.length) {
          setSelectedUsers(
            event.eligibleUsers.map(user => 
              typeof user === 'object' ? 
                { value: user._id, label: user.name || user.email } : 
                user
            )
          );
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
        toast.error('Failed to load event details');
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
    fetchUsers();
    fetchEventDetails();
  }, [id, isEditMode, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleDepartmentSelection = (e) => {
    const { value, checked } = e.target;
    
    setFormData(prev => {
      let updatedDepts = [...prev.eligibleDepartments];
      
      if (checked) {
        updatedDepts.push(value);
      } else {
        updatedDepts = updatedDepts.filter(id => id !== value);
      }
      
      return { ...prev, eligibleDepartments: updatedDepts };
    });
  };

  const handleUserSelection = (e) => {
    const { value } = e.target;
    const option = e.target.options[e.target.selectedIndex];
    const text = option.text;
    
    if (value === '') return;

    // Check if user is already selected
    if (formData.eligibleUsers.includes(value)) {
      toast.error('User already added');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      eligibleUsers: [...prev.eligibleUsers, value]
    }));
    
    setSelectedUsers(prev => [
      ...prev,
      { value, label: text }
    ]);
    
    // Reset the select to default
    e.target.value = '';
  };

  const removeSelectedUser = (userId) => {
    setFormData(prev => ({
      ...prev,
      eligibleUsers: prev.eligibleUsers.filter(id => id !== userId)
    }));
    
    setSelectedUsers(prev => 
      prev.filter(user => user.value !== userId)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Extract data based on attendee type
      const submitData = { ...formData };
      
      // Only include relevant fields based on attendee type
      if (submitData.attendeeType === 'all') {
        submitData.eligibleDepartments = [];
        submitData.eligibleUsers = [];
      } else if (submitData.attendeeType === 'department') {
        submitData.eligibleUsers = [];
      } else if (submitData.attendeeType === 'specific') {
        submitData.eligibleDepartments = [];
      }
      
      if (isEditMode) {
        await axios.put(`/api/events/${id}`, submitData);
        toast.success('Event updated successfully');
      } else {
        const response = await axios.post('/api/events', submitData);
        toast.success('Event created successfully');
        // Navigate to the new event's detail page
        navigate(`/events/${response.data._id}`);
        return; // Early return to prevent the next navigate
      }
      
      navigate(`/events/${id}`);
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(error.response?.data?.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-1">
          <li>
            <Link to="/events" className="text-gray-500 hover:text-gray-700">Events</Link>
          </li>
          <li className="flex items-center">
            <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-1" />
            <span className="text-gray-900 font-medium">
              {isEditMode ? 'Edit Event' : 'New Event'}
            </span>
          </li>
        </ol>
      </nav>

      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
            <Link to={isEditMode ? `/events/${id}` : "/events"} className="mr-2 text-gray-500 hover:text-gray-700">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            {isEditMode ? 'Edit Event' : 'Create New Event'}
          </h1>
        </div>
      </div>

      {/* Event Form */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <form onSubmit={handleSubmit}>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Event Name */}
              <div className="sm:col-span-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Event Name <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter event name"
                  />
                </div>
              </div>

              {/* Department */}
              <div className="sm:col-span-2">
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 flex items-center">
                  <BuildingOfficeIcon className="h-4 w-4 mr-1.5 text-gray-500" />
                  Department
                </label>
                <div className="mt-1">
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">No Department</option>
                    {departments.map(dept => (
                      <option key={dept._id} value={dept._id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Start Date */}
              <div className="sm:col-span-3">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1.5 text-gray-500" />
                  Start Date & Time <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="datetime-local"
                    name="startDate"
                    id="startDate"
                    required
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* End Date */}
              <div className="sm:col-span-3">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1.5 text-gray-500" />
                  End Date & Time <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="datetime-local"
                    name="endDate"
                    id="endDate"
                    required
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="sm:col-span-6">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-1.5 text-gray-500" />
                  Location
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="location"
                    id="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter event location"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                    placeholder="Enter event description"
                  />
                </div>
              </div>

              {/* Active Status */}
              <div className="sm:col-span-6">
                <div className="flex items-center">
                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active (Event is visible and can accept attendees)
                  </label>
                </div>
              </div>

              {/* Attendee Type */}
              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <UserGroupIcon className="h-4 w-4 mr-1.5 text-gray-500" />
                  Who can attend this event?
                </label>
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-6">
                  <div className="flex items-center">
                    <input
                      id="attendeeType-all"
                      name="attendeeType"
                      type="radio"
                      value="all"
                      checked={formData.attendeeType === 'all'}
                      onChange={handleInputChange}
                      className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300"
                    />
                    <label htmlFor="attendeeType-all" className="ml-2 block text-sm text-gray-700">
                      Open to All
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="attendeeType-department"
                      name="attendeeType"
                      type="radio"
                      value="department"
                      checked={formData.attendeeType === 'department'}
                      onChange={handleInputChange}
                      className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300"
                    />
                    <label htmlFor="attendeeType-department" className="ml-2 block text-sm text-gray-700">
                      Specific Departments
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="attendeeType-specific"
                      name="attendeeType"
                      type="radio"
                      value="specific"
                      checked={formData.attendeeType === 'specific'}
                      onChange={handleInputChange}
                      className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300"
                    />
                    <label htmlFor="attendeeType-specific" className="ml-2 block text-sm text-gray-700">
                      Selected Users
                    </label>
                  </div>
                </div>
              </div>

              {/* Department Selection - Only shown if attendeeType is 'department' */}
              {formData.attendeeType === 'department' && (
                <div className="sm:col-span-6">
                  <fieldset>
                    <legend className="text-sm font-medium text-gray-700 mb-2">
                      Select eligible departments
                    </legend>
                    <div className="grid grid-cols-1 gap-y-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {departments.map(dept => (
                        <div key={dept._id} className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id={`dept-${dept._id}`}
                              type="checkbox"
                              value={dept._id}
                              checked={formData.eligibleDepartments.includes(dept._id)}
                              onChange={handleDepartmentSelection}
                              className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor={`dept-${dept._id}`} className="font-medium text-gray-700">
                              {dept.name}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                    {formData.eligibleDepartments.length === 0 && (
                      <p className="mt-2 text-sm text-amber-600">
                        Please select at least one department.
                      </p>
                    )}
                  </fieldset>
                </div>
              )}

              {/* User Selection - Only shown if attendeeType is 'specific' */}
              {formData.attendeeType === 'specific' && (
                <div className="sm:col-span-6">
                  <label htmlFor="userSelect" className="block text-sm font-medium text-gray-700 mb-2">
                    Select eligible users
                  </label>
                  <div className="flex">
                    <select
                      id="userSelect"
                      onChange={handleUserSelection}
                      className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      defaultValue=""
                    >
                      <option value="" disabled>Select user to add</option>
                      {users.map(user => (
                        <option key={user._id} value={user._id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Display selected users */}
                  <div className="mt-3">
                    <div className="flow-root">
                      <ul className="flex flex-wrap gap-2">
                        {selectedUsers.map(user => (
                          <li key={user.value} className="flex items-center px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">
                            <UserIcon className="h-4 w-4 mr-1 text-purple-500" />
                            {user.label}
                            <button
                              type="button"
                              onClick={() => removeSelectedUser(user.value)}
                              className="ml-1.5 text-purple-500 hover:text-purple-700"
                              title="Remove user"
                            >
                              <span className="sr-only">Remove user</span>
                              <span aria-hidden="true">&times;</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {formData.eligibleUsers.length === 0 && (
                      <p className="mt-2 text-sm text-amber-600">
                        Please select at least one user.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="px-4 py-3 bg-gray-50 sm:px-6 flex justify-end">
            <Link
              to={isEditMode ? `/events/${id}` : "/events"}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 mr-3"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || 
                (formData.attendeeType === 'department' && formData.eligibleDepartments.length === 0) ||
                (formData.attendeeType === 'specific' && formData.eligibleUsers.length === 0)
              }
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                saving || 
                (formData.attendeeType === 'department' && formData.eligibleDepartments.length === 0) ||
                (formData.attendeeType === 'specific' && formData.eligibleUsers.length === 0)
                  ? 'opacity-70 cursor-not-allowed'
                  : ''
              }`}
            >
              {saving 
                ? 'Saving...' 
                : isEditMode 
                  ? 'Update Event'
                  : 'Create Event'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;