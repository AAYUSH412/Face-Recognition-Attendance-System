import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { UsersIcon, ClockIcon, CheckCircleIcon, XCircleIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalFaculty: 0,
    todayAttendance: 0,
    pendingVerifications: 0,
    departments: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState([])
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        // For now, we'll simulate this data
        // In a real implementation, you would fetch this from your API
        
        // Simulate fetching users count
        const usersResponse = await axios.get('/api/users')
        const users = usersResponse.data
        
        // Get today's date
        const today = new Date().toISOString().split('T')[0]
        
        // Simulate fetching today's attendance
        const attendanceResponse = await axios.get(`/api/attendance?startDate=${today}&endDate=${today}`)
        const todayAttendance = attendanceResponse.data
        
        // Simulate fetching departments
        const departmentsResponse = await axios.get('/api/departments')
        const departments = departmentsResponse.data
        
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
          departments: departments.length
        })
        
        // Set recent activity (could be latest attendance records)
        setRecentActivity(todayAttendance.slice(0, 5))
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [])
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      {loading ? (
        <div className="mt-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
          <p className="mt-2 text-gray-500">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
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
                  <div className="flex justify-between text-sm">
                    <div>
                      <span className="text-gray-500">Students:</span> 
                      <span className="ml-1 font-medium">{stats.totalStudents}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Faculty:</span> 
                      <span className="ml-1 font-medium">{stats.totalFaculty}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link to="/users" className="font-medium text-purple-600 hover:text-purple-500">
                    View all users
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
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
                <div className="mt-4">
                  <div className="flex items-center">
                    <XCircleIcon className="h-5 w-5 text-yellow-500" />
                    <span className="ml-1 text-sm text-gray-500">
                      {stats.pendingVerifications} pending verifications
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link to="/attendance" className="font-medium text-purple-600 hover:text-purple-500">
                    View attendance records
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
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
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link to="/departments" className="font-medium text-purple-600 hover:text-purple-500">
                    Manage departments
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
            <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
              {recentActivity.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {recentActivity.map((record) => (
                    <li key={record._id}>
                      <div className="px-4 py-4 flex items-center sm:px-6">
                        <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                          <div>
                            <div className="flex text-sm">
                              <p className="font-medium text-purple-600 truncate">{record.user.name}</p>
                              <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                                {record.user.role === 'student' ? '(Student)' : '(Faculty)'}
                              </p>
                            </div>
                            <div className="mt-2 flex">
                              <div className="flex items-center text-sm text-gray-500">
                                {record.checkIn?.time ? (
                                  <>
                                    <CheckCircleIcon 
                                      className={`flex-shrink-0 mr-1.5 h-5 w-5 ${record.checkIn.verified ? 'text-green-400' : 'text-yellow-400'}`} 
                                    />
                                    <span>Checked in at {new Date(record.checkIn.time).toLocaleTimeString()}</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircleIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                    <span>No check-in</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex-shrink-0 sm:mt-0">
                            <div className="flex overflow-hidden">
                              <span className={`px-2 py-1 text-xs font-medium ${
                                record.status === 'present' ? 'bg-green-100 text-green-800' :
                                record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              } rounded-full`}>
                                {record.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No recent activity to display</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard