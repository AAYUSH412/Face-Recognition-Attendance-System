import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../utils/api.js';
import { format, startOfMonth, endOfMonth, parseISO, isValid, subMonths } from 'date-fns';
import { CheckCircleIcon, XCircleIcon, ClockIcon, CalendarIcon, ArrowPathIcon, DocumentArrowDownIcon, ChartBarIcon, FunnelIcon, EyeIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid, XCircleIcon as XCircleIconSolid, ClockIcon as ClockIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Badge, 
  AttendanceLineChart,
  AttendancePieChart,
  StatsCard,
  AnimatedDiv,
  FadeIn,
  StaggerContainer,
  StaggerItem,
  LoadingSpinner,
  AnimatedCounter,
  Button
} from './ui';

const AttendanceHistory = () => {
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showChart, setShowChart] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });

  // Predefined date ranges
  const datePresets = [
    {
      label: 'Today',
      getValue: () => ({
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd')
      })
    },
    {
      label: 'Yesterday',
      getValue: () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return {
          startDate: format(yesterday, 'yyyy-MM-dd'),
          endDate: format(yesterday, 'yyyy-MM-dd')
        };
      }
    },
    {
      label: 'This Week',
      getValue: () => {
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        return {
          startDate: format(startOfWeek, 'yyyy-MM-dd'),
          endDate: format(new Date(), 'yyyy-MM-dd')
        };
      }
    },
    {
      label: 'This Month',
      getValue: () => ({
        startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd')
      })
    },
    {
      label: 'Last Month',
      getValue: () => {
        const today = new Date();
        const firstDayLastMonth = startOfMonth(subMonths(today, 1));
        const lastDayLastMonth = endOfMonth(subMonths(today, 1));
        return {
          startDate: format(firstDayLastMonth, 'yyyy-MM-dd'),
          endDate: format(lastDayLastMonth, 'yyyy-MM-dd')
        };
      }
    },
    {
      label: 'Last 30 Days',
      getValue: () => {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
        return {
          startDate: format(thirtyDaysAgo, 'yyyy-MM-dd'),
          endDate: format(today, 'yyyy-MM-dd')
        };
      }
    }
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch attendance records and stats in parallel
      const [attendanceResponse, statsResponse] = await Promise.all([
        api.get(`/api/attendance/me?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&page=${currentPage}&limit=10`),
        api.get(`/api/attendance/stats?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`)
      ]);
      
      // Handle attendance data
      let attendanceData = [];
      if (Array.isArray(attendanceResponse.data)) {
        attendanceData = attendanceResponse.data;
      } else if (attendanceResponse.data && Array.isArray(attendanceResponse.data.records)) {
        attendanceData = attendanceResponse.data.records;
        setTotalPages(attendanceResponse.data.pagination?.pages || 1);
      }
      
      setAttendance(attendanceData);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setError('Failed to load attendance data. Please try again.');
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  }, [dateRange, currentPage]);

  useEffect(() => {
    fetchData();
  }, [dateRange, currentPage, fetchData]);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page when date changes
  };

  const handlePresetSelect = (preset) => {
    setDateRange(preset.getValue());
    setCurrentPage(1);
  };

  const exportToCSV = async () => {
    try {
      const response = await api.get(`/api/attendance/export?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Attendance data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      present: { variant: 'success', icon: CheckCircleIconSolid, label: 'Present' },
      late: { variant: 'warning', icon: ClockIconSolid, label: 'Late' },
      absent: { variant: 'error', icon: XCircleIconSolid, label: 'Absent' },
      'half-day': { variant: 'secondary', icon: ClockIconSolid, label: 'Half Day' },
      'early-checkout': { variant: 'warning', icon: ClockIconSolid, label: 'Early Checkout' }
    };

    const config = statusConfig[status] || statusConfig.absent;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getVerificationStatus = (record) => {
    const checkInVerified = record.checkIn?.verified;
    const checkOutVerified = record.checkOut?.verified;
    
    if (checkInVerified && checkOutVerified) {
      return { status: 'fully-verified', label: 'Fully Verified', variant: 'success' };
    } else if (checkInVerified || checkOutVerified) {
      return { status: 'partially-verified', label: 'Partially Verified', variant: 'warning' };
    } else {
      return { status: 'pending', label: 'Pending Verification', variant: 'outline' };
    }
  };

  // Prepare chart data

  const pieChartData = useMemo(() => {
    if (!stats) return [];
    
    return [
      { name: 'Present', value: stats.present, color: '#10B981' },
      { name: 'Late', value: stats.late, color: '#F59E0B' },
      { name: 'Absent', value: stats.absent, color: '#EF4444' },
      { name: 'Half Day', value: stats.halfDay, color: '#6B7280' }
    ].filter(item => item.value > 0);
  }, [stats]);

  if (loading && !attendance.length) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded-md w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded-md w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <FadeIn>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Attendance History</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track your attendance records and performance metrics
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <FunnelIcon className="h-4 w-4" />
              Filters
              {showFilters ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChart(!showChart)}
              className="flex items-center gap-2"
            >
              <ChartBarIcon className="h-4 w-4" />
              {showChart ? 'Show' : 'Hide'} Charts
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              className="flex items-center gap-2"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              Export
            </Button>
            
            <Button
              size="sm"
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <AnimatedDiv className="transition-all duration-300">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Date Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quick Presets */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Quick Selection
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {datePresets.map((preset) => (
                      <Button
                        key={preset.label}
                        variant="outline"
                        size="sm"
                        onClick={() => handlePresetSelect(preset)}
                        className="text-xs"
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Custom Date Range */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={dateRange.startDate}
                      onChange={handleDateChange}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={dateRange.endDate}
                      onChange={handleDateChange}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedDiv>
        )}

        {/* Statistics Cards */}
        {stats && (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StaggerItem>
              <StatsCard
                title="Present Days"
                value={<AnimatedCounter value={stats.present || 0} />}
                description={`${stats.presentPercentage || 0}% attendance rate`}
                icon={CheckCircleIcon}
                trend={{ value: stats.presentPercentage, isPositive: (stats.presentPercentage || 0) >= 80 }}
                color="success"
              />
            </StaggerItem>
            
            <StaggerItem>
              <StatsCard
                title="Late Days"
                value={<AnimatedCounter value={stats.late || 0} />}
                description={`${stats.latePercentage || 0}% of total days`}
                icon={ClockIcon}
                trend={{ value: stats.latePercentage, isPositive: (stats.latePercentage || 0) <= 10 }}
                color="warning"
              />
            </StaggerItem>
            
            <StaggerItem>
              <StatsCard
                title="Absent Days"
                value={<AnimatedCounter value={stats.absent || 0} />}
                description={`${stats.absentPercentage || 0}% of total days`}
                icon={XCircleIcon}
                trend={{ value: stats.absentPercentage, isPositive: (stats.absentPercentage || 0) <= 5 }}
                color="error"
              />
            </StaggerItem>
            
            <StaggerItem>
              <StatsCard
                title="Avg Hours/Day"
                value={<AnimatedCounter value={parseFloat(stats.averageHoursWorked || 0)} formatter={(val) => `${val.toFixed(1)}h`} />}
                description={`Total: ${(stats.present * parseFloat(stats.averageHoursWorked || 0)).toFixed(1)}h worked`}
                icon={ClockIcon}
                trend={{ value: stats.averageHoursWorked, isPositive: (stats.averageHoursWorked || 0) >= 7 }}
                color="primary"
              />
            </StaggerItem>
          </StaggerContainer>
        )}

        {/* Charts */}
        {showChart && attendance.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">      
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <AttendancePieChart data={pieChartData} height={300} />
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Attendance Records */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Attendance Records</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {loading ? 'Loading...' : `${attendance.length} records`}
                </span>
                <div className="flex rounded-lg border border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1 text-sm rounded-l-lg ${
                      viewMode === 'grid' 
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' 
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-1 text-sm rounded-r-lg ${
                      viewMode === 'table' 
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' 
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                  >
                    Table
                  </button>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <XCircleIcon className="mx-auto h-12 w-12 text-red-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Error Loading Data</h3>
                <p className="mt-1 text-sm text-gray-500">{error}</p>
                <Button
                  onClick={fetchData}
                  className="mt-4"
                  size="sm"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            ) : attendance.length > 0 ? (
              <>
                {viewMode === 'grid' ? (
                  <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {attendance.map((record) => {
                      const verification = getVerificationStatus(record);
                      return (
                        <StaggerItem key={record._id}>
                          <Card className="hover:shadow-md transition-shadow duration-200">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                                    {format(parseISO(record.date), 'MMM dd, yyyy')}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    {format(parseISO(record.date), 'EEEE')}
                                  </p>
                                </div>
                                {getStatusBadge(record.status)}
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">Check In:</span>
                                  <div className="flex items-center gap-1">
                                    {record.checkIn?.time && (
                                      <div className={`w-2 h-2 rounded-full ${record.checkIn.verified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                    )}
                                    <span className="text-sm font-medium">
                                      {formatTime(record.checkIn?.time)}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">Check Out:</span>
                                  <div className="flex items-center gap-1">
                                    {record.checkOut?.time && (
                                      <div className={`w-2 h-2 rounded-full ${record.checkOut.verified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                    )}
                                    <span className="text-sm font-medium">
                                      {formatTime(record.checkOut?.time)}
                                    </span>
                                  </div>
                                </div>
                                
                                {record.hoursWorked && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Hours:</span>
                                    <span className="text-sm font-medium">{record.hoursWorked}h</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                <Badge variant={verification.variant} size="sm">
                                  {verification.label}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        </StaggerItem>
                      );
                    })}
                  </StaggerContainer>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Check In
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Check Out
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Hours
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Verification
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {attendance.map((record) => {
                          const verification = getVerificationStatus(record);
                          return (
                            <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {format(parseISO(record.date), 'MMM dd, yyyy')}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {format(parseISO(record.date), 'EEEE')}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {record.checkIn?.time ? (
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${record.checkIn.verified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                    <span className="text-sm text-gray-900 dark:text-white">{formatTime(record.checkIn.time)}</span>
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-500">Not recorded</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {record.checkOut?.time ? (
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${record.checkOut.verified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                    <span className="text-sm text-gray-900 dark:text-white">{formatTime(record.checkOut.time)}</span>
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-500">Not recorded</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-900 dark:text-white">
                                  {record.hoursWorked ? `${record.hoursWorked}h` : 'N/A'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(record.status)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant={verification.variant} size="sm">
                                  {verification.label}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6 mt-6">
                    <div className="flex justify-between flex-1 sm:hidden">
                      <Button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        variant="outline"
                        size="sm"
                      >
                        Previous
                      </Button>
                      <Button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        variant="outline"
                        size="sm"
                      >
                        Next
                      </Button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Page <span className="font-medium">{currentPage}</span> of{' '}
                          <span className="font-medium">{totalPages}</span>
                        </p>
                      </div>
                      <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                          <Button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            variant="outline"
                            size="sm"
                            className="rounded-r-none"
                          >
                            Previous
                          </Button>
                          <Button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            variant="outline"
                            size="sm"
                            className="rounded-l-none"
                          >
                            Next
                          </Button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No records found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No attendance records found in the selected date range.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </FadeIn>
  );
};

export default AttendanceHistory;