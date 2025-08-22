import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api.js';
import { format, parseISO, isToday, subDays } from 'date-fns';
import { 
  CameraIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  CalendarIcon, 
  ChartBarIcon, 
  UserIcon,
  ClipboardDocumentCheckIcon,
  ArrowPathIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    hoursWorked: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { currentUser } = useAuth();
  
  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const last30Days = subDays(today, 30);
      
      // Format dates for API query
      const startDate = last30Days.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];
      
      const response = await api.get(`/api/attendance/me?startDate=${startDate}&endDate=${endDate}`);
      
      // Handle both array response format and object with records property
      let attendanceData = [];
      if (Array.isArray(response.data)) {
        attendanceData = response.data;
      } else if (response.data && Array.isArray(response.data.records)) {
        attendanceData = response.data.records;
      }
      
      // Find today's attendance
      const todayRecord = attendanceData.find(record => 
        isToday(parseISO(record.date))
      );
      
      setTodayAttendance(todayRecord || null);
      
      // Get last 5 records
      const recent = attendanceData
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
      
      setRecentAttendance(recent);
      
      // Calculate stats
      const present = attendanceData.filter(record => record.status === 'present').length;
      const absent = attendanceData.filter(record => record.status === 'absent').length;
      const late = attendanceData.filter(record => record.status === 'late').length;
      const totalHoursWorked = attendanceData.reduce((total, record) => total + (record.hoursWorked || 0), 0);
      
      setStats({
        present,
        absent,
        late,
        hoursWorked: parseFloat(totalHoursWorked.toFixed(1))
      });
      
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAttendanceData();
    setRefreshing(false);
    toast.success('Dashboard updated!');
  };
  
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      return format(new Date(timeString), 'hh:mm a');
    } catch {
      return 'Invalid time';
    }
  };

  return (
    <div className="space-y-6">
        {/* Greeting Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white p-6 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Welcome back, {currentUser?.name?.split(' ')[0]}!
              </h1>
              <p className="mt-2 text-indigo-100">
                {new Date().toLocaleDateString(undefined, { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <button 
              onClick={handleRefresh} 
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors duration-200"
              disabled={refreshing}
            >
              <ArrowPathIcon className={`h-5 w-5 text-white ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/attendance"
              className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200"
            >
              <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2" />
              Mark Attendance
            </Link>
            <Link
              to="/history"
              className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200"
            >
              <ClockIcon className="h-5 w-5 mr-2" />
              View History
            </Link>
            <Link
              to="/events"
              className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200"
            >
              <CalendarIcon className="h-5 w-5 mr-2" />
              Events
            </Link>
            <Link
              to="/profile"
              className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200"
            >
              <UserIcon className="h-5 w-5 mr-2" />
              Profile
            </Link>
          </div>
        </div>
        
        {/* Today's Status Card */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-indigo-600" />
              Today's Attendance Status
            </h2>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="py-8 flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            ) : todayAttendance ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div className="flex items-center">
                    <div className={`rounded-full p-2 mr-3 ${
                      todayAttendance.status === 'present' ? 'bg-green-100 text-green-700' : 
                      todayAttendance.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                    {todayAttendance.status === 'present' ? (
                      <CheckCircleIcon className="h-6 w-6" />
                    ) : todayAttendance.status === 'late' ? (
                      <ClockIcon className="h-6 w-6" />
                    ) : (
                      <XCircleIcon className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {todayAttendance.status === 'present' ? 'Present' : 
                       todayAttendance.status === 'late' ? 'Present (Late)' : 
                       'Absent'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {format(parseISO(todayAttendance.date), 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
                
                {todayAttendance.hoursWorked > 0 && (
                  <div className="flex items-center px-4 py-2 bg-indigo-50 rounded-lg">
                    <ClockIcon className="h-5 w-5 mr-2 text-indigo-600" />
                    <span className="text-indigo-800 font-medium">
                      {todayAttendance.hoursWorked} hours worked
                    </span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg border ${
                  todayAttendance.checkIn?.time ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">Check In</h3>
                    {todayAttendance.checkIn?.time && (
                      <span className={`text-sm ${
                        todayAttendance.checkIn?.verified ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {todayAttendance.checkIn?.verified ? 'Verified' : 'Pending verification'}
                      </span>
                    )}
                  </div>
                  
                  {todayAttendance.checkIn?.time ? (
                    <div className="text-lg font-semibold">
                      {formatTime(todayAttendance.checkIn.time)}
                    </div>
                  ) : (
                    <div className="text-gray-500">Not checked in yet</div>
                  )}
                </div>
                
                <div className={`p-4 rounded-lg border ${
                  todayAttendance.checkOut?.time ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">Check Out</h3>
                    {todayAttendance.checkOut?.time && (
                      <span className={`text-sm ${
                        todayAttendance.checkOut?.verified ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {todayAttendance.checkOut?.verified ? 'Verified' : 'Pending verification'}
                      </span>
                    )}
                  </div>
                  
                  {todayAttendance.checkOut?.time ? (
                    <div className="text-lg font-semibold">
                      {formatTime(todayAttendance.checkOut.time)}
                    </div>
                  ) : (
                    <div className="text-gray-500">Not checked out yet</div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-center">
                <Link
                  to="/attendance"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <CameraIcon className="h-5 w-5 mr-2" />
                  {!todayAttendance.checkIn?.time ? 'Check In Now' : 
                   !todayAttendance.checkOut?.time ? 'Check Out Now' : 
                   'View Attendance'}
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                <CameraIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Attendance Today</h3>
              <p className="mt-1 text-sm text-gray-500">
                You haven't marked your attendance for today.
              </p>
              <div className="mt-6">
                <Link
                  to="/attendance"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <CameraIcon className="h-5 w-5 mr-2" />
                  Check In Now
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Present Days</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.present}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Late Days</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.late}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                <XCircleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Absent Days</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.absent}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                <ChartBarIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Hours Worked</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.hoursWorked} hrs</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Attendance */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Recent Attendance</h2>
          <Link 
            to="/history" 
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
          >
            View all
            <ChevronRightIcon className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="border-t border-gray-200">
          {loading ? (
            <div className="py-8 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : recentAttendance.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {recentAttendance.map((record) => (
                <li key={record._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`rounded-full p-2 mr-3 ${
                        record.status === 'present' ? 'bg-green-100 text-green-700' : 
                        record.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {record.status === 'present' ? (
                          <CheckCircleIcon className="h-5 w-5" />
                        ) : record.status === 'late' ? (
                          <ClockIcon className="h-5 w-5" />
                        ) : (
                          <XCircleIcon className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {format(parseISO(record.date), 'EEEE, MMMM d')}
                        </p>
                        <p className="text-sm text-gray-500">
                          Status: <span className="capitalize">{record.status}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {record.checkIn?.time && (
                        <p className="text-sm text-gray-500">
                          In: {formatTime(record.checkIn.time)}
                        </p>
                      )}
                      {record.checkOut?.time && (
                        <p className="text-sm text-gray-500">
                          Out: {formatTime(record.checkOut.time)}
                        </p>
                      )}
                      {record.hoursWorked > 0 && (
                        <p className="text-sm font-medium text-indigo-600">
                          {record.hoursWorked} hrs
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <ClipboardDocumentCheckIcon className="mx-auto h-10 w-10 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recent attendance records</h3>
              <p className="mt-1 text-sm text-gray-500">
                Your attendance history will appear here once you start marking attendance.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;