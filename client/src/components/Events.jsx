import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  CalendarIcon, 
  MapPinIcon,
  QrCodeIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowPathIcon,
  BuildingOfficeIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  UserIcon,
  EyeIcon,
  PlusIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import {
  CalendarIcon as CalendarIconSolid,
  ClockIcon as ClockIconSolid,
  MapPinIcon as MapPinIconSolid,
} from '@heroicons/react/24/solid';
import QRCodeScanner from './QRCodeScanner';

const Events = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, upcoming, completed
  const [filterType, setFilterType] = useState('all'); // all, today, upcoming, past
  const [sortBy, setSortBy] = useState('startDate'); // startDate, name, location
  const [showFilters, setShowFilters] = useState(false);
  const [attendanceData, setAttendanceData] = useState({});
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  useEffect(() => {
    fetchEvents();
    if (currentUser) {
      fetchUserAttendanceData();
    }
  }, [currentUser]);

  const fetchEvents = async (params = {}) => {
    setRefreshing(true);
    try {
      const queryParams = new URLSearchParams();
      
      // Add filter parameters
      if (params.upcoming) queryParams.append('upcoming', 'true');
      if (params.past) queryParams.append('past', 'true');
      if (params.today) queryParams.append('today', 'true');
      if (params.department) queryParams.append('department', params.department);
      
      const url = `/api/events${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await api.get(url);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUserAttendanceData = async () => {
    setLoadingAttendance(true);
    try {
      // Fetch user's attendance history to check which events they've attended
      const response = await api.get('/api/events/my-attendance');
      const attendanceMap = {};
      (response.data.records || []).forEach(attendance => {
        if (attendance.event && attendance.event._id) {
          attendanceMap[attendance.event._id] = attendance;
        }
      });
      setAttendanceData(attendanceMap);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const handleFilterChange = (type, value) => {
    switch (type) {
      case 'search':
        setSearchTerm(value);
        break;
      case 'status':
        setFilterStatus(value);
        break;
      case 'type':
        setFilterType(value);
        // Apply backend filtering for specific types
        if (value === 'today') {
          fetchEvents({ today: true });
        } else if (value === 'upcoming') {
          fetchEvents({ upcoming: true });
        } else if (value === 'past') {
          fetchEvents({ past: true });
        } else {
          fetchEvents();
        }
        break;
      case 'sort':
        setSortBy(value);
        break;
      default:
        break;
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterType('all');
    setSortBy('startDate');
    fetchEvents();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit',
    });
  };

  const getTimeUntilEvent = (startDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const diffMs = start - now;
    
    if (diffMs <= 0) return null;
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    } else {
      return 'Starting soon';
    }
  };

  const isEventActive = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    return now >= startDate && now <= endDate && event.isActive;
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    
    if (!event.isActive) {
      return 'inactive';
    } else if (now < startDate) {
      return 'upcoming';
    } else if (now > endDate) {
      return 'completed';
    } else {
      return 'active';
    }
  };

  const getEventStatusBadge = (event) => {
    const status = getEventStatus(event);
    const statusConfig = {
      inactive: { 
        bg: 'bg-red-100', 
        text: 'text-red-800', 
        label: 'Inactive',
        icon: '🚫'
      },
      upcoming: { 
        bg: 'bg-blue-100', 
        text: 'text-blue-800', 
        label: 'Upcoming',
        icon: '🔜'
      },
      completed: { 
        bg: 'bg-gray-100', 
        text: 'text-gray-800', 
        label: 'Completed',
        icon: '✅'
      },
      active: { 
        bg: 'bg-green-100', 
        text: 'text-green-800', 
        label: 'Active',
        icon: '🟢'
      }
    };

    const config = statusConfig[status];
    
    return (
      <span className={`${config.bg} ${config.text} px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center`}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const getUserAttendanceStatus = (eventId) => {
    return attendanceData[eventId] || null;
  };

  const getAttendanceStatusBadge = (eventId) => {
    const attendance = getUserAttendanceStatus(eventId);
    
    if (!attendance) return null;
    
    return (
      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center">
        <span className="mr-1">✓</span>
        Attended
      </span>
    );
  };

  const filteredAndSortedEvents = () => {
    let filtered = events;

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        event.name.toLowerCase().includes(searchLower) ||
        event.description?.toLowerCase().includes(searchLower) ||
        event.location?.toLowerCase().includes(searchLower) ||
        event.department?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(event => getEventStatus(event) === filterStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'location':
          return (a.location || '').localeCompare(b.location || '');
        case 'startDate':
        default:
          return new Date(a.startDate) - new Date(b.startDate);
      }
    });

    return filtered;
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <CalendarIcon className="h-7 w-7 mr-2 text-indigo-600" />
          Events
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => fetchEvents()}
            disabled={refreshing}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <FunnelIcon className="h-4 w-4 mr-1.5" />
            Filters
          </button>
          <button
            onClick={() => setShowScanner(!showScanner)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <QrCodeIcon className="h-4 w-4 mr-1.5" />
            {showScanner ? 'Hide Scanner' : 'Scan QR Code'}
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events by name, description, location..."
                  value={searchTerm}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="block px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Events</option>
                <option value="today">Today</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="block px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="startDate">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="location">Sort by Location</option>
              </select>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Status:</label>
                <select
                  value={filterStatus}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="block px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <button
                onClick={resetFilters}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* QR Scanner */}
      {showScanner && (
        <div className="mb-6">
          <QRCodeScanner onScanSuccess={() => {
            setShowScanner(false);
            fetchUserAttendanceData(); // Refresh attendance data after successful scan
          }} />
        </div>
      )}

      {/* Events List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-indigo-500" />
              Events ({filteredAndSortedEvents().length})
            </h3>
            {(currentUser?.role === 'admin' || currentUser?.role === 'faculty') && (
              <Link
                to="/events/create"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-1.5" />
                Create Event
              </Link>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading events...</p>
          </div>
        ) : filteredAndSortedEvents().length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredAndSortedEvents().map(event => {
              const eventStatus = getEventStatus(event);
              const timeUntil = getTimeUntilEvent(event.startDate);
              const userAttendance = getUserAttendanceStatus(event._id);
              
              return (
                <div key={event._id} className="px-4 py-6 sm:px-6 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Event Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {event.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              {getEventStatusBadge(event)}
                              {userAttendance && getAttendanceStatusBadge(event._id)}
                            </div>
                          </div>
                          {event.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {/* Date and Time */}
                        <div className="flex items-start text-sm text-gray-600">
                          <CalendarIconSolid className="flex-shrink-0 mr-2 h-4 w-4 text-indigo-500 mt-0.5" />
                          <div>
                            <div className="font-medium">{formatDate(event.startDate)}</div>
                            <div className="text-xs text-gray-500">
                              {formatTime(event.startDate)} - {formatTime(event.endDate)}
                            </div>
                            {timeUntil && eventStatus === 'upcoming' && (
                              <div className="text-xs text-blue-600 font-medium mt-1">
                                Starts in {timeUntil}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Location */}
                        {event.location && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPinIconSolid className="flex-shrink-0 mr-2 h-4 w-4 text-indigo-500" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}

                        {/* Department */}
                        {event.department && (
                          <div className="flex items-center text-sm text-gray-600">
                            <BuildingOfficeIcon className="flex-shrink-0 mr-2 h-4 w-4 text-indigo-500" />
                            <span className="truncate">{event.department.name}</span>
                          </div>
                        )}

                        {/* Organizer */}
                        {event.organizer && (
                          <div className="flex items-center text-sm text-gray-600">
                            <UserIcon className="flex-shrink-0 mr-2 h-4 w-4 text-indigo-500" />
                            <span className="truncate">{event.organizer.name}</span>
                          </div>
                        )}

                        {/* Attendee Type */}
                        <div className="flex items-center text-sm text-gray-600">
                          <UserGroupIcon className="flex-shrink-0 mr-2 h-4 w-4 text-indigo-500" />
                          <span className="capitalize">{event.attendeeType} attendees</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          to={`/events/${event._id}`}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                          <EyeIcon className="h-4 w-4 mr-1.5" />
                          View Details
                        </Link>

                        {isEventActive(event) && !userAttendance && (
                          <button
                            onClick={() => setShowScanner(true)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                          >
                            <QrCodeIcon className="h-4 w-4 mr-1.5" />
                            Mark Attendance
                          </button>
                        )}

                        {userAttendance && (
                          <div className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-md">
                            <span className="mr-1.5">✓</span>
                            Attended on {formatDate(userAttendance.checkedInAt)}
                          </div>
                        )}

                        {(currentUser?.role === 'admin' || 
                          currentUser?.role === 'faculty' || 
                          event.organizer?._id === currentUser?._id) && (
                          <Link
                            to={`/events/${event._id}/attendees`}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                          >
                            <UserGroupIcon className="h-4 w-4 mr-1.5" />
                            View Attendees
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'There are no events at the moment.'
              }
            </p>
            {(searchTerm || filterStatus !== 'all' || filterType !== 'all') && (
              <div className="mt-6">
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading Overlay for Attendance Data */}
      {loadingAttendance && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-700">Loading attendance data...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;