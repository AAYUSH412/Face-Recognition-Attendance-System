import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  UserGroupIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  QrCodeIcon,
  UserPlusIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const EventAttendees = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showManualCheckIn, setShowManualCheckIn] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [addingAttendee, setAddingAttendee] = useState(false);
  const [filteredAttendees, setFilteredAttendees] = useState([]);

  useEffect(() => {
    fetchEventData();
  }, [id]);

  useEffect(() => {
    if (attendees.length) {
      filterAttendees();
    }
  }, [searchTerm, attendees]);

  const fetchEventData = async () => {
    setLoading(true);
    try {
      // Fetch event details
      const eventResponse = await axios.get(`/api/events/${id}`);
      setEvent(eventResponse.data);

      // Fetch event attendees
      const attendeesResponse = await axios.get(`/api/events/${id}/attendees`);
      setAttendees(attendeesResponse.data);
      setFilteredAttendees(attendeesResponse.data);
    } catch (error) {
      console.error('Error fetching event data:', error);
      toast.error('Failed to load event data');
      if (error.response?.status === 404) {
        navigate('/events');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterAttendees = () => {
    if (!searchTerm.trim()) {
      setFilteredAttendees(attendees);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = attendees.filter(attendee => 
      attendee.user?.name?.toLowerCase().includes(term) ||
      attendee.user?.email?.toLowerCase().includes(term) ||
      attendee.user?.registrationId?.toLowerCase().includes(term)
    );
    
    setFilteredAttendees(filtered);
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      
      // Filter out users who are already attendees
      const existingUserIds = attendees.map(attendee => attendee.user?._id);
      const availableUsersList = response.data.filter(user => 
        !existingUserIds.includes(user._id)
      );
      
      setAvailableUsers(availableUsersList);
    } catch (error) {
      console.error('Error fetching available users:', error);
      toast.error('Failed to load users list');
    }
  };

  const handleShowManualCheckIn = () => {
    setShowManualCheckIn(true);
    fetchAvailableUsers();
  };

  const handleManualCheckIn = async () => {
    if (!selectedUser) {
      toast.error('Please select a user to check in');
      return;
    }

    setAddingAttendee(true);
    try {
      const response = await axios.post(`/api/events/${id}/manual-checkin`, {
        userId: selectedUser
      });
      
      toast.success('User successfully checked in to the event');
      
      // Add the new attendee to the list
      const updatedAttendees = [...attendees, response.data.attendance];
      setAttendees(updatedAttendees);
      
      // Reset form
      setSelectedUser('');
      setShowManualCheckIn(false);
    } catch (error) {
      console.error('Error checking in user:', error);
      toast.error(error.response?.data?.message || 'Failed to check in user');
    } finally {
      setAddingAttendee(false);
    }
  };

  const exportToCSV = async () => {
    try {
      // Create CSV data
      let csvContent = 'Name,Email,ID,Check-in Time,Check-in By,Verified\n';
      
      attendees.forEach(attendee => {
        const row = [
          attendee.user?.name || 'N/A',
          attendee.user?.email || 'N/A',
          attendee.user?.registrationId || 'N/A',
          new Date(attendee.checkedInAt).toLocaleString(),
          attendee.checkedInBy?.name || 'System',
          attendee.verified ? 'Yes' : 'No'
        ].map(field => `"${field}"`).join(',');
        
        csvContent += row + '\n';
      });
      
      // Create a download link and trigger download
      const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${event.name.replace(/\s+/g, '_')}_attendees.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Attendee list exported successfully');
    } catch (error) {
      console.error('Error exporting attendees:', error);
      toast.error('Failed to export attendee list');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-yellow-400">⚠️</span>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Event not found. It may have been deleted.
            </p>
            <div className="mt-4">
              <Link
                to="/events"
                className="text-sm font-medium text-yellow-700 hover:text-yellow-600"
              >
                ← Back to all events
              </Link>
            </div>
          </div>
        </div>
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
            <Link to={`/events/${id}`} className="text-gray-500 hover:text-gray-700">{event.name}</Link>
          </li>
          <li className="flex items-center">
            <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-1" />
            <span className="text-gray-900 font-medium">Attendees</span>
          </li>
        </ol>
      </nav>

      <div className="mb-6 flex flex-wrap items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
          <Link to={`/events/${id}`} className="mr-2 text-gray-500 hover:text-gray-700">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <span>Event Attendees</span>
        </h1>

        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleShowManualCheckIn}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
          >
            <UserPlusIcon className="h-4 w-4 mr-1.5 text-gray-500" />
            Add Attendee
          </button>
          <button
            type="button"
            onClick={exportToCSV}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-1.5 text-gray-500" />
            Export CSV
          </button>
          <Link
            to={`/events/${id}`}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
          >
            <QrCodeIcon className="h-4 w-4 mr-1.5 text-gray-500" />
            View QR Code
          </Link>
        </div>
      </div>

      {/* Event Summary Card */}
      <div className="mb-6 bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-purple-600" />
            {event.name}
          </h2>
          <span className="text-sm text-gray-500">
            {filteredAttendees.length} attendee{filteredAttendees.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Event Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatDate(event.startDate)} to {formatDate(event.endDate)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Location</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {event.location || 'Not specified'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Manual Check-in Form */}
      {showManualCheckIn && (
        <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-purple-800 mb-4">Manual Attendance Check-in</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label htmlFor="userSelect" className="block text-sm font-medium text-gray-700">
                Select User
              </label>
              <select
                id="userSelect"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
              >
                <option value="">Select a user</option>
                {availableUsers.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email}) - ID: {user.registrationId || 'N/A'}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleManualCheckIn}
                disabled={!selectedUser || addingAttendee}
                className={`w-full inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                  !selectedUser || addingAttendee ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {addingAttendee ? 'Adding...' : 'Check In'}
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowManualCheckIn(false)}
            className="mt-4 text-sm text-purple-700 hover:text-purple-900"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <div className="mt-1 relative rounded-md shadow-sm max-w-lg">
          <input
            type="text"
            name="search"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="focus:ring-purple-500 focus:border-purple-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
            placeholder="Search by name, email, or ID..."
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Attendees List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {filteredAttendees.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-in Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-in By
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verification
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAttendees.map((attendee) => (
                  <tr key={attendee._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium">
                            {attendee.user?.name?.charAt(0) || '?'}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {attendee.user?.name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {attendee.user?.email || 'No email'}
                          </div>
                          {attendee.user?.registrationId && (
                            <div className="text-xs text-gray-500">
                              ID: {attendee.user.registrationId}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(attendee.checkedInAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {attendee.checkedInBy ? attendee.checkedInBy.name : 'Self Check-in'}
                      </div>
                      {attendee.notes && (
                        <div className="text-xs text-gray-500">
                          {attendee.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        attendee.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {attendee.verified ? (
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                        ) : (
                          <XCircleIcon className="h-4 w-4 mr-1" />
                        )}
                        {attendee.verified ? 'Verified' : 'Not Verified'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No attendees found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'No attendees match your search criteria.' : 'This event has no attendees yet.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200"
              >
                Clear search
              </button>
            )}
            {!searchTerm && (
              <div className="mt-6">
                <button
                  onClick={handleShowManualCheckIn}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <UserPlusIcon className="h-5 w-5 mr-2" />
                  Add Attendee
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventAttendees;