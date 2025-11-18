import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
import QRCodeScanner from '../components/QRCodeScanner.jsx';
import { 
  CalendarIcon, 
  MapPinIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ArrowLeftIcon,
  ClockIcon,
  QrCodeIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import {
  CalendarIcon as CalendarIconSolid,
  ClockIcon as ClockIconSolid,
  MapPinIcon as MapPinIconSolid,
} from '@heroicons/react/24/solid';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/api/events/${id}`);
        setEvent(response.data);
      } catch (error) {
        console.error('Error fetching event:', error);
        toast.error('Failed to load event details');
        if (error.response?.status === 404) {
          navigate('/events');
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchUserAttendance = async () => {
      setLoadingAttendance(true);
      try {
        const response = await api.get('/api/events/my-attendance');
        const eventAttendance = (response.data.records || []).find(attendance => 
          attendance.event && attendance.event._id === id
        );
        setAttendanceData(eventAttendance || null);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      } finally {
        setLoadingAttendance(false);
      }
    };

    fetchEvent();
    if (currentUser) {
      fetchUserAttendance();
    }
  }, [id, currentUser, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventStatus = () => {
    if (!event) return 'unknown';
    
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

  const getStatusBadge = () => {
    const status = getEventStatus();
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
      <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-sm font-medium inline-flex items-center`}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const isEventActive = () => {
    const status = getEventStatus();
    return status === 'active';
  };

  const canEditEvent = () => {
    return currentUser?.role === 'admin' || 
           currentUser?.role === 'faculty' || 
           event?.organizer?._id === currentUser?._id;
  };

  const canViewAttendees = () => {
    return currentUser?.role === 'admin' || 
           currentUser?.role === 'faculty' || 
           event?.organizer?._id === currentUser?._id;
  };

  const handleDeleteEvent = async () => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await api.delete(`/api/events/${id}`);
      toast.success('Event deleted successfully');
      navigate('/events');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error(error.response?.data?.message || 'Failed to delete event');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Event not found</h3>
          <p className="mt-1 text-sm text-gray-500">The event you're looking for doesn't exist.</p>
          <Link
            to="/events"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/events')}
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Events
          </button>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <CalendarIcon className="h-8 w-8 mr-3 text-indigo-600" />
                {event.name}
              </h1>
              <div className="mt-2 flex items-center gap-3">
                {getStatusBadge()}
                {attendanceData && (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium inline-flex items-center">
                    <span className="mr-1">✓</span>
                    Attended
                  </span>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {canViewAttendees() && (
                <Link
                  to={`/events/${id}/attendees`}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  View Attendees
                </Link>
              )}
              
              {canEditEvent() && (
                <>
                  <Link
                    to={`/events/${id}/edit`}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                  <button
                    onClick={handleDeleteEvent}
                    disabled={deleting}
                    className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {deleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-600 mr-2"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Delete
                      </>
                    )}
                  </button>
                </>
              )}
              
              {isEventActive() && !attendanceData && (
                <button
                  onClick={() => setShowScanner(!showScanner)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <QrCodeIcon className="h-4 w-4 mr-2" />
                  {showScanner ? 'Hide Scanner' : 'Mark Attendance'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* QR Scanner */}
        {showScanner && (
          <div className="mb-8">
            <QRCodeScanner onScanSuccess={() => {
              setShowScanner(false);
              // Refresh attendance data after successful scan
              if (currentUser) {
                const refreshAttendance = async () => {
                  setLoadingAttendance(true);
                  try {
                    const response = await api.get('/api/events/my-attendance');
                    const eventAttendance = (response.data.records || []).find(attendance => 
                      attendance.event && attendance.event._id === id
                    );
                    setAttendanceData(eventAttendance || null);
                  } catch (error) {
                    console.error('Error fetching attendance:', error);
                  } finally {
                    setLoadingAttendance(false);
                  }
                };
                refreshAttendance();
              }
            }} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Information */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Event Information</h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center text-sm font-medium text-gray-900 mb-2">
                      <CalendarIconSolid className="h-4 w-4 text-indigo-500 mr-2" />
                      Start Date & Time
                    </div>
                    <p className="text-gray-700">{formatDateTime(event.startDate)}</p>
                  </div>
                  <div>
                    <div className="flex items-center text-sm font-medium text-gray-900 mb-2">
                      <ClockIconSolid className="h-4 w-4 text-indigo-500 mr-2" />
                      End Date & Time
                    </div>
                    <p className="text-gray-700">{formatDateTime(event.endDate)}</p>
                  </div>
                </div>

                {/* Location */}
                {event.location && (
                  <div>
                    <div className="flex items-center text-sm font-medium text-gray-900 mb-2">
                      <MapPinIconSolid className="h-4 w-4 text-indigo-500 mr-2" />
                      Location
                    </div>
                    <p className="text-gray-700">{event.location}</p>
                  </div>
                )}

                {/* Description */}
                {event.description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
                  </div>
                )}

                {/* Attendee Information */}
                <div>
                  <div className="flex items-center text-sm font-medium text-gray-900 mb-2">
                    <UserGroupIcon className="h-4 w-4 text-indigo-500 mr-2" />
                    Attendee Type
                  </div>
                  <p className="text-gray-700 capitalize">{event.attendeeType} attendees</p>
                  
                  {event.attendeeType === 'department' && event.eligibleDepartments?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Eligible departments:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {event.eligibleDepartments.map(dept => (
                          <span key={dept._id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {dept.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {event.attendeeType === 'specific' && event.eligibleUsers?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Eligible users:</p>
                      <div className="mt-1 space-y-1">
                        {event.eligibleUsers.slice(0, 5).map(user => (
                          <span key={user._id} className="inline-block text-sm text-gray-700 mr-3">
                            {user.name}
                          </span>
                        ))}
                        {event.eligibleUsers.length > 5 && (
                          <span className="text-sm text-gray-500">
                            ... and {event.eligibleUsers.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Attendance Status */}
            {!loadingAttendance && (
              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Your Attendance</h2>
                </div>
                <div className="p-6">
                  {attendanceData ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Attendance Confirmed</p>
                          <p className="text-sm text-gray-600">
                            Checked in on {formatDateTime(attendanceData.checkedInAt)}
                          </p>
                          {attendanceData.notes && (
                            <p className="text-xs text-gray-500 mt-1">{attendanceData.notes}</p>
                          )}
                        </div>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        ✓ Attended
                      </span>
                    </div>
                  ) : isEventActive() ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-600 mb-4">You haven't checked in to this event yet.</p>
                      <button
                        onClick={() => setShowScanner(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <QrCodeIcon className="h-4 w-4 mr-2" />
                        Scan QR Code to Check In
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                      <p className="text-sm text-gray-600">
                        {getEventStatus() === 'upcoming' 
                          ? 'Event has not started yet' 
                          : 'Event has ended - attendance not recorded'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organizer Information */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Organizer</h2>
              </div>
              <div className="p-6">
                {event.organizer && (
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{event.organizer.name}</p>
                      <p className="text-sm text-gray-600">{event.organizer.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Department */}
            {event.department && (
              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Department</h2>
                </div>
                <div className="p-6">
                  <div className="flex items-center">
                    <BuildingOfficeIcon className="h-5 w-5 text-indigo-500 mr-3" />
                    <span className="text-gray-900">{event.department.name}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Event Details */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Event Details</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Status</span>
                  {getStatusBadge()}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Created</span>
                  <span className="text-sm text-gray-900">
                    {formatDate(event.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Last Updated</span>
                  <span className="text-sm text-gray-900">
                    {formatDate(event.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
