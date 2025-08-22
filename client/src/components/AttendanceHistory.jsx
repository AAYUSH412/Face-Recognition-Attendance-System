import { useState, useEffect } from 'react';
import api from '../utils/api.js';
import { format, startOfMonth, endOfMonth, parseISO, isValid, subMonths } from 'date-fns';
import { CheckCircleIcon, XCircleIcon, ClockIcon, CalendarIcon, ArrowPathIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AttendanceHistory = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    fetchAttendance();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/attendance/me?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      
      // Handle both array response format and object with records property
      let attendanceData = [];
      if (Array.isArray(response.data)) {
        attendanceData = response.data;
      } else if (response.data && Array.isArray(response.data.records)) {
        attendanceData = response.data.records;
      }
      
      console.log("Fetched attendance data:", attendanceData);
      setAttendance(attendanceData);
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      setError('Failed to load attendance history. Please try again.');
      toast.error('Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const setLastMonth = () => {
    const today = new Date();
    const firstDayLastMonth = startOfMonth(subMonths(today, 1));
    const lastDayLastMonth = endOfMonth(subMonths(today, 1));
    
    setDateRange({
      startDate: format(firstDayLastMonth, 'yyyy-MM-dd'),
      endDate: format(lastDayLastMonth, 'yyyy-MM-dd')
    });
  };

  const setThisMonth = () => {
    const today = new Date();
    setDateRange({
      startDate: format(startOfMonth(today), 'yyyy-MM-dd'),
      endDate: format(today, 'yyyy-MM-dd')
    });
  };

  const calculateStats = () => {
    if (!attendance.length) return { present: 0, absent: 0, late: 0, totalDays: 0, hoursWorked: 0 };

    const present = attendance.filter(record => record.status === 'present').length;
    const absent = attendance.filter(record => record.status === 'absent').length;
    const late = attendance.filter(record => record.status === 'late').length;
    const totalHoursWorked = attendance.reduce((total, record) => total + (record.hoursWorked || 0), 0);
    
    return {
      present,
      absent,
      late,
      totalDays: attendance.length,
      hoursWorked: parseFloat(totalHoursWorked.toFixed(2))
    };
  };

  const stats = calculateStats();

  const getAttendancePercentage = () => {
    if (stats.totalDays === 0) return 0;
    return Math.round((stats.present / stats.totalDays) * 100);
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    
    try {
      const date = parseISO(timeString);
      if (!isValid(date)) return 'Invalid time';
      
      return format(date, 'hh:mm a');
    } catch (error) {
      console.error("Error formatting time:", error);
      return 'Invalid time';
    }
  };

  return (
    <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Attendance History</h1>
        
        {/* Date Filter */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Filter by Date</h2>
            <div className="mt-2 md:mt-0 flex space-x-2">
              <button
                onClick={setThisMonth}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                This Month
              </button>
              <button
                onClick={setLastMonth}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Last Month
              </button>
              <button
                onClick={fetchAttendance}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              Refresh
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              <CalendarIcon className="h-4 w-4 inline mr-1" />
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              <CalendarIcon className="h-4 w-4 inline mr-1" />
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                <CheckCircleIcon className="h-6 w-6 text-indigo-600" />
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
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <div className="text-green-600 font-bold text-lg">{getAttendancePercentage()}%</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Attendance Rate</dt>
                  <dd>
                    <div className="text-sm text-gray-500">{stats.present} of {stats.totalDays} days</div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                      <div 
                        className="bg-green-600 h-2.5 rounded-full" 
                        style={{ width: `${getAttendancePercentage()}%` }}
                      />
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Attendance Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Attendance Records</h3>
          <span className="text-sm text-gray-500">
            {loading ? 'Loading...' : `Showing ${attendance.length} records`}
          </span>
        </div>
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-10 bg-gray-50">
            <XCircleIcon className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Error Loading Data</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <button
              onClick={fetchAttendance}
              className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1.5" />
              Try Again
            </button>
          </div>
        ) : attendance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check In
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check Out
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verification
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendance.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(parseISO(record.date), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(parseISO(record.date), 'EEEE')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.checkIn?.time ? (
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-2.5 w-2.5 rounded-full ${record.checkIn.verified ? 'bg-green-500' : 'bg-yellow-500'} mr-2`}></div>
                          <div className="text-sm text-gray-900">{formatTime(record.checkIn.time)}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Not recorded</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.checkOut?.time ? (
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-2.5 w-2.5 rounded-full ${record.checkOut.verified ? 'bg-green-500' : 'bg-yellow-500'} mr-2`}></div>
                          <div className="text-sm text-gray-900">{formatTime(record.checkOut.time)}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Not recorded</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {record.hoursWorked ? `${record.hoursWorked} hrs` : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        record.status === 'present' ? 'bg-green-100 text-green-800' :
                        record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                        record.status === 'absent' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.checkIn?.verified && record.checkOut?.verified ? 
                        'Fully verified' : 
                        record.checkIn?.verified || record.checkOut?.verified ? 
                        'Partially verified' : 'Pending verification'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No records found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No attendance records found in the selected date range.
            </p>
          </div>
        )}
      </div>
      
      {/* Total Hours Card */}
      {stats.hoursWorked > 0 && (
        <div className="mt-6 bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <ClockIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5">
                <h3 className="text-lg font-medium text-gray-900">Total Hours Worked</h3>
                <div className="mt-1 text-xl font-semibold text-blue-600">
                  {stats.hoursWorked} hours
                </div>
                <p className="text-sm text-gray-500">
                  Total hours worked during the selected period
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceHistory;