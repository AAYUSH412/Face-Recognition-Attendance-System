import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { format, isToday, subDays } from 'date-fns';
import { 
  CameraIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  CalendarIcon, 
  UserIcon,
  ClipboardDocumentCheckIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  BellIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  EyeIcon,
  MapPinIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon as CheckCircleIconSolid,
  ClockIcon as ClockIconSolid,
  XCircleIcon as XCircleIconSolid
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  FadeIn,
  LoadingSpinner,
  HoverScale,
  AnimateOnScroll,
  EnhancedAvatar,
  SwipeableCard,
  AdvancedTooltip,
  FloatingActionMenu
} from './ui/index.js';

const ModernDashboard = () => {
  const { currentUser } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // const [showModal, setShowModal] = useState(false);
  // const [quickActionExpanded, setQuickActionExpanded] = useState(false);
  
  const fetchAttendanceData = React.useCallback(async () => {
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
      } else if (response.data.records) {
        attendanceData = response.data.records;
      }
      
      // Process data
      const todayRecord = attendanceData.find(record => {
        const recordDate = new Date(record.date || record.createdAt);
        return isToday(recordDate);
      });
      
      setTodayAttendance(todayRecord);
      setRecentAttendance(attendanceData.slice(0, 7));
      
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  const refreshData = async () => {
    setRefreshing(true);
    await fetchAttendanceData();
    setRefreshing(false);
    toast.success('Data refreshed successfully');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'late':
        return 'warning';
      case 'absent':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      const date = new Date(timeString);
      return format(date, 'HH:mm');
    } catch {
      return timeString;
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
        <div className="text-center space-y-4">
          <LoadingSpinner size={64} />
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen rounded-b-lg">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-800 border rounded-lg">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-6 py-8">
          <FadeIn>
            <div className="flex items-center justify-between">
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-2">
                  {getGreeting()}, {currentUser?.name || 'User'}! 👋
                </h1>
                <p className="text-blue-100 text-lg">
                  Welcome to your attendance dashboard
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-blue-200" />
                    <span className="text-blue-100 text-sm">{currentUser?.department?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDaysIcon className="h-4 w-4 text-blue-200" />
                    <span className="text-blue-100 text-sm">{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <AdvancedTooltip content="Refresh dashboard data">
                  <Button 
                    onClick={refreshData}
                    disabled={refreshing}
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                  >
                    <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </AdvancedTooltip>
                
                <AdvancedTooltip content="View Profile">
                  <Link to="/profile">
                    <EnhancedAvatar 
                      src={null}
                      alt={currentUser?.name || 'User'}
                      fallback={currentUser?.name?.charAt(0) || 'U'}
                      size="lg"
                      className="ring-2 ring-white/30"
                    />
                  </Link>
                </AdvancedTooltip>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Today's Status - Hero Card */}
        <AnimateOnScroll>
          <SwipeableCard className="overflow-hidden">
            <div className="relative bg-gradient-to-r from-white via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200/50 dark:border-blue-800/50 rounded-2xl p-8">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                        <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          Today's Status
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {format(new Date(), 'EEEE, MMMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    
                    {todayAttendance && (
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Check-in: {formatTime(todayAttendance.checkIn?.time)}
                          </span>
                        </div>
                        {todayAttendance.checkOut?.time && (
                          <div className="flex items-center gap-2">
                            <ClockIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Check-out: {formatTime(todayAttendance.checkOut?.time)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center space-y-4">
                    {todayAttendance ? (
                      <>
                        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg">
                          {todayAttendance.status === 'present' && <CheckCircleIconSolid className="h-10 w-10 text-white" />}
                          {todayAttendance.status === 'late' && <ClockIconSolid className="h-10 w-10 text-white" />}
                          {todayAttendance.status === 'absent' && <XCircleIconSolid className="h-10 w-10 text-white" />}
                        </div>
                        <Badge variant={getStatusColor(todayAttendance.status)} size="lg" className="px-4 py-2">
                          {todayAttendance.status.charAt(0).toUpperCase() + todayAttendance.status.slice(1)}
                        </Badge>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Badge variant="error" size="lg">Not Marked</Badge>
                          <Link to="/attendance">
                            <Button className="w-full mt-7 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                              Mark Attendance
                            </Button>
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </SwipeableCard>
        </AnimateOnScroll>



        {/* Enhanced Recent Activity */}
        <AnimateOnScroll>
          <Card className="shadow-lg border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Recent Activity</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Your latest attendance records
                  </p>
                </div>
                <Link to="/history">
                  <Button variant="outline" size="sm" className="gap-2 hover:bg-blue-50">
                    <EyeIcon className="h-4 w-4" />
                    View All
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAttendance.length > 0 ? (
                  recentAttendance.map((attendance, index) => (
                    <HoverScale key={index}>
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-full ${
                            attendance.status === 'present' 
                              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                              : attendance.status === 'late'
                              ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {attendance.status === 'present' ? (
                              <CheckCircleIconSolid className="h-5 w-5" />
                            ) : attendance.status === 'late' ? (
                              <ClockIconSolid className="h-5 w-5" />
                            ) : (
                              <XCircleIconSolid className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-gray-100">
                              {format(new Date(attendance.date || attendance.createdAt), 'EEEE, MMM d')}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-3">
                              <span>Check-in: {formatTime(attendance.checkIn?.time)}</span>
                              {attendance.checkOut?.time && (
                                <span>Check-out: {formatTime(attendance.checkOut?.time)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge variant={getStatusColor(attendance.status)} className="px-3 py-1">
                          {attendance.status.charAt(0).toUpperCase() + attendance.status.slice(1)}
                        </Badge>
                      </div>
                    </HoverScale>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <ClipboardDocumentCheckIcon className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No attendance records found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Start by marking your first attendance to see your activity here.
                    </p>
                    <Link to="/attendance">
                      <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                        <CameraIcon className="h-4 w-4 mr-2" />
                        Mark Your First Attendance
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </AnimateOnScroll>

        {/* Quick Actions with Enhanced Design */}
        <AnimateOnScroll>
          <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardHeader>
              <CardTitle className="text-white text-xl">Quick Actions</CardTitle>
              <p className="text-blue-100">Take action with one click</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/attendance">
                  <HoverScale>
                    <Button 
                      variant="outline" 
                      className="w-full h-24 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm flex flex-col gap-2"
                    >
                      <CameraIcon className="h-8 w-8" />
                      <span className="font-medium">Mark Attendance</span>
                    </Button>
                  </HoverScale>
                </Link>
                <Link to="/history">
                  <HoverScale>
                    <Button 
                      variant="outline" 
                      className="w-full h-24 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm flex flex-col gap-2"
                    >
                      <DocumentTextIcon className="h-8 w-8" />
                      <span className="font-medium">View History</span>
                    </Button>
                  </HoverScale>
                </Link>
                <Link to="/profile">
                  <HoverScale>
                    <Button 
                      variant="outline" 
                      className="w-full h-24 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm flex flex-col gap-2"
                    >
                      <UserIcon className="h-8 w-8" />
                      <span className="font-medium">Edit Profile</span>
                    </Button>
                  </HoverScale>
                </Link>
              </div>
            </CardContent>
          </Card>
        </AnimateOnScroll>
      </div>

      {/* Floating Action Menu */}
      <FloatingActionMenu
        mainIcon={CameraIcon}
        actions={[
          {
            icon: CameraIcon,
            label: 'Mark Attendance',
            onClick: () => window.location.href = '/attendance'
          },
          {
            icon: DocumentTextIcon,
            label: 'View History',
            onClick: () => window.location.href = '/history'
          },
          {
            icon: BellIcon,
            label: 'Notifications',
            onClick: () => toast.success('Notifications clicked!')
          }
        ]}
        className="fixed bottom-6 right-6 z-50"
      />
    </div>
  );
};

export default ModernDashboard;
