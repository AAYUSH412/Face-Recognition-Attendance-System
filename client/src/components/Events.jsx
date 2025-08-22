import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
import { 
  CalendarIcon, 
  MapPinIcon,
  QrCodeIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowPathIcon,
  BuildingOfficeIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import QRCodeScanner from './QRCodeScanner';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setRefreshing(true);
    try {
      const response = await api.get('/api/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
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

  const isEventActive = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    return now >= startDate && now <= endDate && event.isActive;
  };

  const getEventStatusBadge = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    
    if (!event.isActive) {
      return <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-medium">Inactive</span>;
    } else if (now < startDate) {
      return <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">Upcoming</span>;
    } else if (now > endDate) {
      return <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-medium">Completed</span>;
    } else {
      return <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">Active</span>;
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <CalendarIcon className="h-7 w-7 mr-2 text-indigo-600" />
            Events
          </h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchEvents}
            disabled={refreshing}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
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

      {showScanner && (
        <div className="mb-6">
          <QRCodeScanner />
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-indigo-500" />
            Upcoming & Active Events
          </h3>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading events...</p>
          </div>
        ) : events.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {events.map(event => (
              <li key={event._id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex items-center justify-between">
                    <div className="sm:flex sm:justify-between w-full">
                      <div>
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-indigo-600 truncate">{event.name}</p>
                          <div className="ml-2">
                            {getEventStatusBadge(event)}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <CalendarIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          <p>{formatDate(event.startDate)} {formatTime(event.startDate)} - {formatTime(event.endDate)}</p>
                        </div>
                        {event.location && (
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <MapPinIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <p>{event.location}</p>
                          </div>
                        )}
                        {event.department && (
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <BuildingOfficeIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <p>{event.department.name}</p>
                          </div>
                        )}
                      </div>
                      {isEventActive(event) && (
                        <div className="mt-4 sm:mt-0">
                          <button
                            onClick={() => setShowScanner(true)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                          >
                            <QrCodeIcon className="h-4 w-4 mr-1.5" />
                            Mark Attendance
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-16">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
            <p className="mt-1 text-sm text-gray-500">
              There are no upcoming or active events at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;