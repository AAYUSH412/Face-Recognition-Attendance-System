import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  CheckCircleIcon,
  ClockIcon,
  UserCircleIcon,
  CalendarIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

const ManualAttendance = () => {
  const [currentAttendance, setCurrentAttendance] = useState(null);
  const [isMarking, setIsMarking] = useState(false);
  const [selectedType, setSelectedType] = useState("check-in");
  const [location, setLocation] = useState("Main Campus");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today's attendance on component mount
  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const response = await axios.get('/api/attendance/today');
      setCurrentAttendance(response.data);
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Error fetching attendance:', error);
      }
    }
  };

  const markAttendance = async () => {
    setIsMarking(true);
    try {
      const response = await axios.post('/api/attendance/mark-manual', {
        type: selectedType,
        location: location,
        method: 'manual',
        timestamp: new Date().toISOString()
      });

      setCurrentAttendance(response.data);
      toast.success(`${selectedType === 'check-in' ? 'Check-in' : 'Check-out'} successful!`);
      
      // Refresh after marking
      setTimeout(() => {
        fetchTodayAttendance();
      }, 1000);
      
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setIsMarking(false);
    }
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'text-green-600 bg-green-50';
      case 'late': return 'text-yellow-600 bg-yellow-50';
      case 'absent': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const canCheckOut = currentAttendance && currentAttendance.checkInTime && !currentAttendance.checkOutTime;
  const canCheckIn = !currentAttendance || !currentAttendance.checkInTime;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <ClipboardDocumentCheckIcon className="h-8 w-8 text-blue-600 mr-3" />
              Manual Attendance
            </h2>
            <p className="text-gray-600 mt-1">Mark your attendance manually for today</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Current Time</div>
            <div className="text-xl font-semibold text-gray-900">
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit',
                hour12: true 
              })}
            </div>
            <div className="text-sm text-gray-500">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Today's Attendance Status */}
      {currentAttendance && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${getStatusColor(currentAttendance.status)}`}>
                <UserCircleIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold capitalize">{currentAttendance.status}</p>
              </div>
            </div>
            
            {currentAttendance.checkInTime && (
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-green-50 text-green-600">
                  <CheckCircleIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Check In</p>
                  <p className="font-semibold">{formatTime(currentAttendance.checkInTime)}</p>
                </div>
              </div>
            )}

            {currentAttendance.checkOutTime && (
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-blue-50 text-blue-600">
                  <ClockIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Check Out</p>
                  <p className="font-semibold">{formatTime(currentAttendance.checkOutTime)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Attendance Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mark Attendance</h3>
        
        <div className="space-y-4">
          {/* Attendance Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attendance Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedType('check-in')}
                disabled={!canCheckIn}
                className={`p-3 rounded-lg border-2 flex items-center justify-center space-x-2 transition-colors ${
                  selectedType === 'check-in'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 text-gray-700 hover:border-green-300'
                } ${!canCheckIn ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <CheckCircleIcon className="h-5 w-5" />
                <span>Check In</span>
              </button>
              <button
                onClick={() => setSelectedType('check-out')}
                disabled={!canCheckOut}
                className={`p-3 rounded-lg border-2 flex items-center justify-center space-x-2 transition-colors ${
                  selectedType === 'check-out'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:border-blue-300'
                } ${!canCheckOut ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <ClockIcon className="h-5 w-5" />
                <span>Check Out</span>
              </button>
            </div>
          </div>

          {/* Location Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your current location"
              />
            </div>
          </div>

          {/* Mark Attendance Button */}
          <button
            onClick={markAttendance}
            disabled={isMarking || (!canCheckIn && !canCheckOut)}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
              selectedType === 'check-in'
                ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-300'
                : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300'
            } disabled:cursor-not-allowed`}
          >
            {isMarking ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Marking...</span>
              </div>
            ) : (
              `Mark ${selectedType === 'check-in' ? 'Check In' : 'Check Out'}`
            )}
          </button>
        </div>

        {/* Info Section */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Manual Attendance Demo Mode</p>
              <ul className="list-disc list-inside space-y-1">
                <li>This is a simplified version for demonstration purposes</li>
                <li>In the full version, face recognition would be used for security</li>
                <li>Manual attendance is currently enabled for easy testing</li>
                <li>Make sure to check out before leaving for accurate time tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualAttendance;
