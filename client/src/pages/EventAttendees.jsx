import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
import { 
  UserGroupIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  FunnelIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

const EventAttendees = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerified, setFilterVerified] = useState('all'); // all, verified, unverified
  const [sortBy, setSortBy] = useState('checkedInAt'); // checkedInAt, name, department

  useEffect(() => {
    // Check permissions
    if (!currentUser || 
        (currentUser.role !== 'admin' && 
         currentUser.role !== 'faculty')) {
      // We'll check if user is organizer after fetching event data
    }
    
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch event details and attendees in parallel
        const [eventResponse, attendeesResponse] = await Promise.all([
          api.get(`/api/events/${id}`),
          api.get(`/api/events/${id}/attendees`)
        ]);
        
        setEvent(eventResponse.data);
        setAttendees(attendeesResponse.data);

        // Check if current user has permission to view attendees
        const eventData = eventResponse.data;
        const canView = currentUser?.role === 'admin' || 
                       currentUser?.role === 'faculty' || 
                       eventData?.organizer?._id === currentUser?._id;
        
        if (!canView) {
          toast.error('You do not have permission to view attendees for this event');
          navigate(`/events/${id}`);
          return;
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load attendees data');
        if (error.response?.status === 404) {
          navigate('/events');
        } else if (error.response?.status === 403) {
          navigate(`/events/${id}`);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, currentUser, navigate]);

  const refreshAttendees = async () => {
    setRefreshing(true);
    try {
      const response = await api.get(`/api/events/${id}/attendees`);
      setAttendees(response.data);
      toast.success('Attendees list refreshed');
    } catch (error) {
      console.error('Error refreshing attendees:', error);
      toast.error('Failed to refresh attendees');
    } finally {
      setRefreshing(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportToCSV = () => {
    if (attendees.length === 0) {
      toast.error('No attendees to export');
      return;
    }

    const headers = ['Name', 'Email', 'Registration ID', 'Department', 'Role', 'Check-in Time', 'Verified', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedAttendees().map(attendee => [
        attendee.user?.name || '',
        attendee.user?.email || '',
        attendee.user?.registrationId || '',
        attendee.user?.department || '',
        attendee.user?.role || '',
        formatDateTime(attendee.checkedInAt),
        attendee.verified ? 'Yes' : 'No',
        (attendee.notes || '').replace(/,/g, ';') // Replace commas to avoid CSV issues
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${event?.name || 'event'}_attendees_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAndSortedAttendees = () => {
    let filtered = attendees;

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(attendee => 
        attendee.user?.name?.toLowerCase().includes(searchLower) ||
        attendee.user?.email?.toLowerCase().includes(searchLower) ||
        attendee.user?.registrationId?.toLowerCase().includes(searchLower) ||
        attendee.user?.department?.toLowerCase().includes(searchLower)
      );
    }

    // Verification filter
    if (filterVerified !== 'all') {
      const isVerified = filterVerified === 'verified';
      filtered = filtered.filter(attendee => attendee.verified === isVerified);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.user?.name || '').localeCompare(b.user?.name || '');
        case 'department':
          return (a.user?.department || '').localeCompare(b.user?.department || '');
        case 'checkedInAt':
        default:
          return new Date(b.checkedInAt) - new Date(a.checkedInAt);
      }
    });

    return filtered;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading attendees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/events/${id}`)}
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Event Details
          </button>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <UserGroupIcon className="h-8 w-8 mr-3 text-indigo-600" />
                Event Attendees
              </h1>
              {event && (
                <p className="mt-2 text-gray-600">
                  <Link to={`/events/${id}`} className="text-indigo-600 hover:text-indigo-800">
                    {event.name}
                  </Link>
                  <span className="mx-2">•</span>
                  {attendees.length} attendee{attendees.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={refreshAttendees}
                disabled={refreshing}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <ArrowPathIcon className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              
              {attendees.length > 0 && (
                <button
                  onClick={exportToCSV}
                  className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  Export CSV
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white shadow sm:rounded-lg mb-6">
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, registration ID, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterVerified}
                  onChange={(e) => setFilterVerified(e.target.value)}
                  className="block px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Attendees</option>
                  <option value="verified">Verified Only</option>
                  <option value="unverified">Unverified Only</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="block px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="checkedInAt">Sort by Check-in Time</option>
                  <option value="name">Sort by Name</option>
                  <option value="department">Sort by Department</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Attendees List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <UserGroupIcon className="h-5 w-5 mr-2 text-indigo-500" />
              Attendees ({filteredAndSortedAttendees().length})
            </h3>
          </div>

          {filteredAndSortedAttendees().length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-in Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedAttendees().map((attendee, index) => (
                    <tr key={attendee._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                              <UserIcon className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {attendee.user?.name || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {attendee.user?.registrationId || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{attendee.user?.email || 'N/A'}</div>
                        <div className="text-sm text-gray-500 capitalize">{attendee.user?.role || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {attendee.user?.department || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateTime(attendee.checkedInAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {attendee.verified ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <XCircleIcon className="h-3 w-3 mr-1" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {attendee.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm || filterVerified !== 'all' 
                  ? 'No matching attendees found' 
                  : 'No attendees yet'
                }
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterVerified !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Attendees will appear here once they check in to the event.'
                }
              </p>
              {(searchTerm || filterVerified !== 'all') && (
                <div className="mt-6">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterVerified('all');
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventAttendees;
