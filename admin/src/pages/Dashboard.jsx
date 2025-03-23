import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { 
  UsersIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  BuildingOfficeIcon,
  ArrowPathIcon,
  CalendarIcon,
  ChartBarIcon,
  ArrowTopRightOnSquareIcon,
  UserGroupIcon,
  AcademicCapIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalFaculty: 0,
    todayAttendance: 0,
    pendingVerifications: 0,
    departments: 0,
    presentPercentage: 0,
    absentPercentage: 0,
    latePercentage: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [todayDate] = useState(new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }))
  
  useEffect(() => {
    fetchDashboardData()
  }, [])
  
  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch users count
      const usersResponse = await axios.get('/api/users')
      const users = usersResponse.data
      
      // Today's date in ISO format
      const today = new Date().toISOString().split('T')[0]
      
      // Fetch today's attendance
      const attendanceResponse = await axios.get(`/api/attendance?startDate=${today}&endDate=${today}`)
      const todayAttendance = attendanceResponse.data.records || []
      
      // Fetch departments
      const departmentsResponse = await axios.get('/api/departments')
      const departments = departmentsResponse.data
      
      // Calculate attendance percentages for today
      const totalAttendanceCount = todayAttendance.length || 1  // Avoid division by zero
      const presentCount = todayAttendance.filter(record => record.status === 'present').length
      const lateCount = todayAttendance.filter(record => record.status === 'late').length
      const absentCount = todayAttendance.filter(record => record.status === 'absent').length
      
      // Calculate stats
      setStats({
        totalUsers: users.length,
        totalStudents: users.filter(user => user.role === 'student').length,
        totalFaculty: users.filter(user => user.role === 'faculty').length,
        todayAttendance: todayAttendance.length,
        pendingVerifications: todayAttendance.filter(record => 
          (!record.checkIn?.verified && record.checkIn?.time) || 
          (!record.checkOut?.verified && record.checkOut?.time)
        ).length,
        departments: departments.length,
        presentPercentage: Math.round((presentCount / totalAttendanceCount) * 100),
        absentPercentage: Math.round((absentCount / totalAttendanceCount) * 100),
        latePercentage: Math.round((lateCount / totalAttendanceCount) * 100)
      })
      
      // Set recent activity (latest attendance records)
      setRecentActivity(todayAttendance.slice(0, 5))
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDashboardData()
    setRefreshing(false)
  }
  
  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Overview of your system's performance and key metrics
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <span className="text-sm text-gray-500">{todayDate}</span>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            disabled={refreshing}
          >
            <ArrowPathIcon className={`-ml-0.5 mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="mt-6 text-center py-10">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-r-2 border-b-2 border-transparent border-l-2 border-purple-600"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading dashboard data...</p>
          <p className="text-sm text-gray-500">This may take a moment</p>
        </div>
      ) : (
        <>
          {/* Today's Overview */}
          <div className="mt-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-purple-500" />
              Today's Overview
            </h2>
            <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 p-3 rounded-md bg-green-100">
                      <CheckCircleIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Present</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{stats.presentPercentage}%</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="relative w-full h-2 bg-gray-200 rounded-full">
                      <div className="absolute top-0 left-0 h-full bg-green-500 rounded-full" style={{ width: `${stats.presentPercentage}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 p-3 rounded-md bg-yellow-100">
                      <ClockIcon className="h-6 w-6 text-yellow-600" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Late</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{stats.latePercentage}%</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="relative w-full h-2 bg-gray-200 rounded-full">
                      <div className="absolute top-0 left-0 h-full bg-yellow-500 rounded-full" style={{ width: `${stats.latePercentage}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 p-3 rounded-md bg-red-100">
                      <XCircleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Absent</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{stats.absentPercentage}%</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="relative w-full h-2 bg-gray-200 rounded-full">
                      <div className="absolute top-0 left-0 h-full bg-red-500 rounded-full" style={{ width: `${stats.absentPercentage}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Users Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 transition-all duration-300 hover:shadow-md">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 rounded-md bg-purple-100">
                    <UsersIcon className="h-6 w-6 text-purple-600" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{stats.totalUsers}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <AcademicCapIcon className="h-5 w-5 text-purple-500 mr-1.5" />
                      <span className="text-gray-500">Students:</span> 
                      <span className="ml-1 font-medium">{stats.totalStudents}</span>
                    </div>
                    <div className="flex items-center">
                      <UserIcon className="h-5 w-5 text-purple-500 mr-1.5" />
                      <span className="text-gray-500">Faculty:</span> 
                      <span className="ml-1 font-medium">{stats.totalFaculty}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link to="/users" className="font-medium text-purple-600 hover:text-purple-500 flex items-center">
                    View all users
                    <ArrowTopRightOnSquareIcon className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Attendance Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 transition-all duration-300 hover:shadow-md">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 rounded-md bg-purple-100">
                    <ClockIcon className="h-6 w-6 text-purple-600" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Today's Attendance</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{stats.todayAttendance}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <div className="flex items-center">
                    <div className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${stats.pendingVerifications > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      {stats.pendingVerifications > 0 ? (
                        <XCircleIcon className="h-4 w-4 mr-1" />
                      ) : (
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                      )}
                      <span>
                        {stats.pendingVerifications > 0 
                          ? `${stats.pendingVerifications} pending verifications` 
                          : "All records verified"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link to="/attendance" className="font-medium text-purple-600 hover:text-purple-500 flex items-center">
                    View attendance records
                    <ArrowTopRightOnSquareIcon className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Departments Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 transition-all duration-300 hover:shadow-md">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 rounded-md bg-purple-100">
                    <BuildingOfficeIcon className="h-6 w-6 text-purple-600" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Departments</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{stats.departments}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <div className="flex items-center">
                    <ChartBarIcon className="h-5 w-5 text-purple-500 mr-1.5" />
                    <span className="text-gray-500">Avg. users per dept:</span>
                    <span className="ml-1 font-medium">
                      {stats.departments > 0 ? Math.round(stats.totalUsers / stats.departments) : 0}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link to="/departments" className="font-medium text-purple-600 hover:text-purple-500 flex items-center">
                    Manage departments
                    <ArrowTopRightOnSquareIcon className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-purple-500" />
              Recent Activity
            </h2>
            <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
              {recentActivity.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {recentActivity.map((record) => (
                    <li key={record._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <div className="px-4 py-4 flex items-center sm:px-6">
                        <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                          <div>
                            <div className="flex text-sm">
                              <p className="font-medium text-purple-600 truncate">{record.user.name}</p>
                              <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                                {record.user.role === 'student' ? (
                                  <span className="inline-flex items-center">
                                    <AcademicCapIcon className="h-4 w-4 mr-1 text-gray-400" />
                                    Student
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center">
                                    <UserIcon className="h-4 w-4 mr-1 text-gray-400" />
                                    Faculty
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="mt-2 flex">
                              <div className="flex items-center text-sm text-gray-500">
                                {record.checkIn?.time ? (
                                  <div className="flex items-center">
                                    <CheckCircleIcon 
                                      className={`flex-shrink-0 mr-1.5 h-5 w-5 ${record.checkIn.verified ? 'text-green-400' : 'text-yellow-400'}`} 
                                    />
                                    <span>
                                      Checked in at {new Date(record.checkIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      {!record.checkIn.verified && <span className="ml-1 text-yellow-600 font-medium">(unverified)</span>}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center">
                                    <XCircleIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                    <span>No check-in</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                            <div className="flex overflow-hidden">
                              <span className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center ${
                                record.status === 'present' ? 'bg-green-100 text-green-800' :
                                record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {record.status === 'present' ? (
                                  <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
                                ) : record.status === 'late' ? (
                                  <ClockIcon className="h-3.5 w-3.5 mr-1" />
                                ) : (
                                  <XCircleIcon className="h-3.5 w-3.5 mr-1" />
                                )}
                                <span className="capitalize">{record.status}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-10">
                  <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
                  <p className="mt-1 text-sm text-gray-500">No attendance records for today yet.</p>
                </div>
              )}
              
              <div className="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Showing the latest {recentActivity.length} records for today
                  </span>
                  <Link
                    to="/attendance"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                  >
                    View All Records
                    <ArrowTopRightOnSquareIcon className="ml-1.5 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard