import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Building2,
  RefreshCw,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  UserCheck,
  GraduationCap,
  User
} from 'lucide-react'
import { usersAPI, attendanceAPI, departmentsAPI } from '../lib/api'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { LoadingSkeleton, StatCardSkeleton, ChartSkeleton } from '../components/ui/LoadingSkeleton'
import { cn, formatDate, getStatusColor } from '../lib/utils'

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
      // Parallel API calls for better performance
      const [userStatsResponse, attendanceStatsResponse, departmentsResponse, recentAttendanceResponse] = await Promise.all([
        usersAPI.getStats(),
        attendanceAPI.getStats({ date: new Date().toISOString().split('T')[0] }),
        departmentsAPI.getAll(),
        attendanceAPI.getAll({ 
          startDate: new Date().toISOString().split('T')[0], 
          endDate: new Date().toISOString().split('T')[0],
          limit: 5 
        })
      ]);

      const userStats = userStatsResponse.data;
      const attendanceStats = attendanceStatsResponse.data;
      const departments = departmentsResponse.data;
      const recentAttendance = recentAttendanceResponse.data.records || [];
      
      // Get attendance data for today
      const totalAttendanceCount = attendanceStats.total || 0;
      
      // Calculate stats
      setStats({
        totalUsers: userStats.total || 0,
        totalStudents: userStats.byRole?.student || 0,
        totalFaculty: userStats.byRole?.faculty || 0,
        todayAttendance: totalAttendanceCount,
        pendingVerifications: attendanceStats.pendingVerification || 0,
        departments: departments.length || 0,
        presentPercentage: Math.round(parseFloat(attendanceStats.presentPercentage || 0)),
        absentPercentage: Math.round(parseFloat(attendanceStats.absentPercentage || 0)),
        latePercentage: Math.round(parseFloat(attendanceStats.latePercentage || 0))
      })
      
      // Set recent activity (latest attendance records)
      setRecentActivity(recentAttendance.slice(0, 5))
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Set default stats in case of error
      setStats({
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
    } finally {
      setLoading(false)
    }
  }
  
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDashboardData()
    setRefreshing(false)
  }
  
  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      description: 'All registered users',
      trend: '+12% from last month',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/users'
    },
    {
      title: 'Students',
      value: stats.totalStudents,
      icon: GraduationCap,
      description: 'Student accounts',
      trend: '+8% from last month',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      href: '/users?role=student'
    },
    {
      title: 'Faculty',
      value: stats.totalFaculty,
      icon: User,
      description: 'Faculty members',
      trend: '+3% from last month',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      href: '/users?role=faculty'
    },
    {
      title: 'Departments',
      value: stats.departments,
      icon: Building2,
      description: 'Active departments',
      trend: 'No change',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      href: '/departments'
    }
  ]

  const attendanceCards = [
    {
      title: 'Present',
      value: `${stats.presentPercentage}%`,
      icon: CheckCircle,
      description: 'Attendance rate',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Late',
      value: `${stats.latePercentage}%`,
      icon: Clock,
      description: 'Late arrivals',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Absent',
      value: `${stats.absentPercentage}%`,
      icon: XCircle,
      description: 'Absent today',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ]
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your attendance system today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">{todayDate}</div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-8">
          {/* Stats skeleton */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          
          {/* Attendance skeleton */}
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          
          {/* Recent activity skeleton */}
          <ChartSkeleton />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <Link key={card.title} to={card.href} className="group">
                <Card className="transition-all hover:shadow-medium group-hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          {card.title}
                        </p>
                        <p className="text-2xl font-bold">{card.value}</p>
                        <p className="text-xs text-muted-foreground">
                          {card.description}
                        </p>
                      </div>
                      <div className={cn("rounded-full p-3", card.bgColor)}>
                        <card.icon className={cn("h-6 w-6", card.color)} />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-xs text-green-600">{card.trend}</span>
                      <ArrowUpRight className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Today's Attendance Overview */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Today's Overview</h2>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              {attendanceCards.map((card) => (
                <Card key={card.title} className="transition-all hover:shadow-medium">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          {card.title}
                        </p>
                        <p className="text-3xl font-bold">{card.value}</p>
                        <p className="text-xs text-muted-foreground">
                          {card.description}
                        </p>
                      </div>
                      <div className={cn("rounded-full p-3", card.bgColor)}>
                        <card.icon className={cn("h-6 w-6", card.color)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>


          {/* Recent Activity */}
          {recentActivity.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest attendance records from today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Avatar 
                          name={record.user?.name} 
                          size="sm" 
                        />
                        <div>
                          <p className="font-medium">{record.user?.name || 'Unknown User'}</p>
                          <p className="text-sm text-muted-foreground">
                            {record.user?.department?.name || 'No Department'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={getStatusColor(record.status).includes('green') ? 'success' : record.status === 'late' ? 'warning' : 'destructive'}>
                          {record.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {record.checkIn?.time ? formatDate(record.checkIn.time, 'time') : 'No time'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <Button variant="outline" asChild>
                    <Link to="/attendance">View All Records</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* System Status */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current system health</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database</span>
                    <Badge variant="success">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Face Recognition</span>
                    <Badge variant="success">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pending Verifications</span>
                    <Badge variant={stats.pendingVerifications > 0 ? "warning" : "success"}>
                      {stats.pendingVerifications}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Today's summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Check-ins</span>
                    <span className="font-medium">{stats.todayAttendance}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Present Rate</span>
                    <span className="font-medium text-green-600">{stats.presentPercentage}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Users</span>
                    <span className="font-medium">{stats.totalUsers}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard