import { Fragment, useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Dialog, Menu, Transition } from '@headlessui/react'
import {
  HomeIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  UserIcon,
  XMarkIcon,
  Bars3Icon,
  BellIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  CalendarIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { 
  Home,
  ClipboardCheck,
  Clock,
  User,
  Calendar,
  Search,
  Bell,
  Settings,
  LogOut,
  Menu as MenuIcon,
  X,
  Shield,
  GraduationCap,
  Building,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  BarChart3,
  Plus,
  Zap
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button, EnhancedAvatar, SkipLink, PerformanceMonitor, Badge } from './ui'
import { cn } from '../lib/utils'

// Dynamic navigation based on user role
const getNavigationItems = (userRole) => {
  const baseNavigation = [
    { 
      name: 'Dashboard', 
      href: '/', 
      icon: HomeIcon, 
      lucideIcon: Home,
      description: 'Overview of your attendance',
      color: 'text-primary-600',
      roles: ['admin', 'faculty', 'student']
    },
    { 
      name: 'Mark Attendance', 
      href: '/attendance', 
      icon: ClipboardDocumentCheckIcon, 
      lucideIcon: ClipboardCheck,
      description: 'Face, Manual, or QR attendance',
      color: 'text-secondary-600',
      roles: ['faculty', 'student']
    },
    { 
      name: 'Attendance History', 
      href: '/history', 
      icon: ClockIcon, 
      lucideIcon: Clock,
      description: 'View past attendance records',
      color: 'text-accent-600',
      roles: ['admin', 'faculty', 'student']
    },
    { 
      name: 'Events', 
      href: '/events', 
      icon: CalendarIcon, 
      lucideIcon: Calendar,
      description: 'View and join events',
      color: 'text-purple-600',
      roles: ['admin', 'faculty', 'student']
    },
    { 
      name: 'Users Management', 
      href: '/users', 
      icon: Users, 
      lucideIcon: Users,
      description: 'Manage system users',
      color: 'text-blue-600',
      roles: ['admin']
    },
    { 
      name: 'Departments', 
      href: '/departments', 
      icon: BuildingOfficeIcon, 
      lucideIcon: Building,
      description: 'Manage departments',
      color: 'text-indigo-600',
      roles: ['admin']
    },
    { 
      name: 'Analytics', 
      href: '/analytics', 
      icon: BarChart3, 
      lucideIcon: BarChart3,
      description: 'View attendance analytics',
      color: 'text-green-600',
      roles: ['admin', 'faculty']
    },
    { 
      name: 'Profile', 
      href: '/profile', 
      icon: UserIcon, 
      lucideIcon: User,
      description: 'Manage your account',
      color: 'text-emerald-600',
      roles: ['admin', 'faculty', 'student']
    },
  ]

  return baseNavigation.filter(item => 
    item.roles.includes(userRole) || item.roles.includes('all')
  )
}

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { currentUser, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [greeting, setGreeting] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [userStatus, setUserStatus] = useState(null)
  const [todayAttendance, setTodayAttendance] = useState(null)
  const [upcomingEvents, setUpcomingEvents] = useState([])
  
  // Memoize navigation items based on user role
  const navigation = useMemo(() => {
    return getNavigationItems(currentUser?.role || 'student')
  }, [currentUser?.role])

  const fetchTodayAttendance = useCallback(async () => {
    try {
      // Mock today's attendance - replace with actual API call
      setTodayAttendance({
        status: 'present',
        checkInTime: '09:15 AM',
        checkOutTime: null
      })
    } catch (error) {
      console.error('Error fetching today attendance:', error)
    }
  }, [])
  
  const fetchUpcomingEvents = useCallback(async () => {
    try {
      // Mock upcoming events - replace with actual API call
      setUpcomingEvents([
        {
          id: 1,
          name: 'Team Meeting',
          startTime: '2:00 PM',
          location: 'Conference Room A'
        }
      ])
    } catch (error) {
      console.error('Error fetching upcoming events:', error)
    }
  }, [])
  
  const updateGreeting = useCallback(() => {
    const hour = new Date().getHours()
    let newGreeting = ''
    
    if (hour < 12) {
      newGreeting = 'Good morning'
    } else if (hour < 18) {
      newGreeting = 'Good afternoon'
    } else {
      newGreeting = 'Good evening'
    }
    
    setGreeting(newGreeting)
  }, [])

  // Update time and greeting
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date())
      updateGreeting()
    }, 60000) // Update every minute
    
    updateGreeting()
    
    return () => clearInterval(intervalId)
  }, [updateGreeting])
  
  const handleLogout = useCallback(() => {
    logout()
    navigate('/login')
  }, [logout, navigate])
  
  const formatDate = useCallback((date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }, [])
  
  const formatTime = useCallback((date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    })
  }, [])
  
  const handleSearch = useCallback((e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setShowSearch(false)
      setSearchQuery('')
    }
  }, [searchQuery, navigate])
  
  const getRoleIcon = useCallback((role) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-red-500" />
      case 'faculty':
        return <GraduationCap className="h-4 w-4 text-blue-500" />
      case 'student':
        return <AcademicCapIcon className="h-4 w-4 text-green-500" />
      default:
        return <User className="h-4 w-4 text-gray-500" />
    }
  }, [])
  
  const getAttendanceStatusIcon = useCallback((status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'late':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }, [])


  const fetchUserStatus = useCallback(async () => {
    try {
      // This would be an API call to get user status
      setUserStatus('active')
    } catch (error) {
      console.error('Error fetching user status:', error)
    }
  }, [])


  // Fetch user status and notifications
  useEffect(() => {
    if (currentUser) {
      fetchUserStatus()
      fetchTodayAttendance()
      fetchUpcomingEvents()
    }
  }, [currentUser, fetchUserStatus, fetchTodayAttendance, fetchUpcomingEvents])


  return (
    <PerformanceMonitor>
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <div className="h-screen flex overflow-hidden bg-background-primary">
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 flex z-40 lg:hidden"
          onClose={setSidebarOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-background-surface border-r border-border-light shadow-strong">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <X className="h-6 w-6" />
                  </Button>
                </div>
              </Transition.Child>
              
              {/* Mobile Sidebar Content */}
              <div className="flex-shrink-0 flex items-center px-6 py-4 border-b border-border-light">
                <img 
                  src="/Face Recognition Attendance System-logo.png" 
                  alt="Face Recognition Attendance System" 
                  className="h-8 w-8 object-contain"
                />
                <h1 className="text-lg font-heading font-semibold text-text-primary ml-3">Attendance</h1>
              </div>
              
              <div className="mt-4 flex-1 h-0 overflow-y-auto">
                {/* Enhanced User Profile Section */}
                {currentUser && (
                  <div className="px-6 py-4 border-b border-border-light">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <EnhancedAvatar 
                          name={currentUser?.name}
                          size="lg"
                          className="ring-2 ring-primary-200"
                        />
                        {userStatus && (
                          <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-text-primary truncate">
                            {currentUser?.name || 'User'}
                          </p>
                          {getRoleIcon(currentUser?.role)}
                        </div>
                        <p className="text-xs text-text-secondary truncate">
                          {currentUser?.email || 'user@example.com'}
                        </p>
                        {currentUser?.department && (
                          <div className="flex items-center mt-1">
                            <Building className="h-3 w-3 text-text-muted mr-1" />
                            <p className="text-xs text-text-muted truncate">
                              {currentUser.department.name || 'Department'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Quick Status Display */}
                    {todayAttendance && (
                      <div className="mt-3 p-2 bg-background-secondary rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getAttendanceStatusIcon(todayAttendance.status)}
                            <span className="text-xs font-medium text-text-primary">
                              Today's Status
                            </span>
                          </div>
                          <Badge 
                            variant={todayAttendance.status === 'present' ? 'success' : 
                                   todayAttendance.status === 'late' ? 'warning' : 'destructive'}
                            className="text-xs"
                          >
                            {todayAttendance.status}
                          </Badge>
                        </div>
                        {todayAttendance.checkInTime && (
                          <p className="text-xs text-text-muted mt-1">
                            Check-in: {todayAttendance.checkInTime}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Quick Actions */}
                <div className="px-6 py-3 border-b border-border-light">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
                    Quick Actions
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-auto py-2 px-3 flex flex-col items-center space-y-1"
                      onClick={() => navigate('/attendance')}
                    >
                      <Zap className="h-4 w-4" />
                      <span className="text-xs">Mark</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-auto py-2 px-3 flex flex-col items-center space-y-1"
                      onClick={() => navigate('/events')}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="text-xs">Events</span>
                    </Button>
                  </div>
                </div>
                
                {/* Navigation */}
                <nav className="px-3 py-4 space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.lucideIcon
                    const isActive = item.href === location.pathname
                    
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={cn(
                          "group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                          isActive
                            ? "bg-primary-50 text-primary-700 border border-primary-200 shadow-sm"
                            : "text-text-secondary hover:bg-background-secondary hover:text-text-primary"
                        )}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Icon
                          className={cn(
                            "mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200",
                            isActive ? "text-primary-600" : "text-text-muted group-hover:text-text-secondary"
                          )}
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{item.name}</div>
                          <p className="text-xs mt-1 text-text-muted group-hover:text-text-secondary">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    )
                  })}
                </nav>
                
                {/* Logout Button */}
                <div className="px-3 py-4 border-t border-border-light mt-auto">
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start text-text-secondary hover:text-error-600 hover:bg-error-50"
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    Sign out
                  </Button>
                </div>
              </div>
            </div>
          </Transition.Child>
          <div className="flex-shrink-0 w-14" aria-hidden="true" />
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-72">
          <div className="flex flex-col h-full bg-background-surface border-r border-border-light">
            {/* Logo Section */}
            <div className="flex-shrink-0 flex items-center px-6 py-4 border-b border-border-light">
              <img 
                src="/Face Recognition Attendance System-logo.png" 
                alt="Face Recognition Attendance System" 
                className="h-8 w-8 object-contain"
              />
              <h1 className="text-lg font-heading font-semibold text-text-primary ml-3">
                Attendance System
              </h1>
            </div>
            
            <div className="flex-1 flex flex-col overflow-y-auto pt-4">
              {/* Enhanced User Profile Section */}
              {currentUser && (
                <div className="px-6 py-4 border-b border-border-light">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <EnhancedAvatar 
                        name={currentUser?.name}
                        size="lg"
                        className="ring-2 ring-primary-200"
                      />
                      {userStatus && (
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {currentUser?.name || 'User'}
                        </p>
                        {getRoleIcon(currentUser?.role)}
                      </div>
                      <p className="text-xs text-text-secondary truncate">
                        {currentUser?.email || 'user@example.com'}
                      </p>
                      {currentUser?.department && (
                        <div className="flex items-center mt-1">
                          <Building className="h-3 w-3 text-text-muted mr-1" />
                          <p className="text-xs text-text-muted truncate">
                            {currentUser.department.name || 'Department'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Quick Actions */}
              <div className="px-6 py-3 border-b border-border-light">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
                  Quick Actions
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-auto py-2 px-3 flex flex-col items-center space-y-1"
                    onClick={() => navigate('/attendance')}
                  >
                    <Zap className="h-4 w-4" />
                    <span className="text-xs">Mark</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-auto py-2 px-3 flex flex-col items-center space-y-1"
                    onClick={() => navigate('/events')}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-xs">Events</span>
                  </Button>
                </div>
              </div>
              
              {/* Navigation */}
              <nav className="flex-1 px-4 py-4 space-y-2">
                {navigation.map((item) => {
                  const Icon = item.lucideIcon
                  const isActive = item.href === location.pathname
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                        isActive
                          ? "bg-primary-50 text-primary-700 border border-primary-200 shadow-sm"
                          : "text-text-secondary hover:bg-background-secondary hover:text-text-primary"
                      )}
                    >
                      <Icon
                        className={cn(
                          "mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200",
                          isActive ? "text-primary-600" : "text-text-muted group-hover:text-text-secondary"
                        )}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{item.name}</div>
                        <p className="text-xs mt-1 text-text-muted group-hover:text-text-secondary">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </nav>
              
              {/* Logout Button */}
              <div className="px-4 py-4 border-t border-border-light">
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start text-text-secondary hover:text-error-600 hover:bg-error-50"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-background-surface border-b border-border-light shadow-soft">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="px-4 border-r border-border-light text-text-secondary lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <MenuIcon className="h-6 w-6" />
          </Button>
          
          <div className="flex-1 px-4 flex items-center justify-between">
            <div className="flex-1 flex items-center space-x-4">
              {/* Date and Time */}
              <div className="hidden sm:flex flex-col justify-center">
                <div className="text-xs text-text-muted">{formatDate(currentTime)}</div>
                <div className="text-sm font-medium text-text-secondary">{formatTime(currentTime)}</div>
              </div>
              
              {/* Enhanced Greeting with Event Info */}
              <div className="hidden lg:block">
                <h2 className="text-xl font-heading font-semibold text-text-primary">
                  {greeting}, {currentUser?.name?.split(' ')[0] || 'there'}!
                </h2>
              </div>
            </div>
            
            {/* Enhanced Right side actions */}
            <div className="flex items-center space-x-3">
              {/* Mobile Search Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden text-text-muted hover:text-text-primary"
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search className="h-5 w-5" />
              </Button>
              
              {/* Enhanced Profile dropdown */}
              <Menu as="div" className="relative">
                <div>
                  <Menu.Button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    <span className="sr-only">Open user menu</span>
                    <EnhancedAvatar 
                      name={currentUser?.name}
                      size="default"
                      className="ring-2 ring-primary-200 hover:ring-primary-300 transition-all duration-200"
                    />
                    <ChevronDownIcon className="ml-1 h-4 w-4 text-text-muted" />
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-64 rounded-xl shadow-strong bg-background-surface ring-1 ring-border-light focus:outline-none divide-y divide-border-light">
                    <div className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <EnhancedAvatar 
                          name={currentUser?.name}
                          size="lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">
                            {currentUser?.name}
                          </p>
                          <p className="text-xs text-text-secondary truncate">
                            {currentUser?.email}
                          </p>
                          <div className="flex items-center mt-1">
                            {getRoleIcon(currentUser?.role)}
                            <span className="ml-1 text-xs text-text-muted capitalize">
                              {currentUser?.role}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={cn(
                              "flex items-center px-4 py-2 text-sm transition-colors duration-150",
                              active ? 'bg-background-secondary text-text-primary' : 'text-text-secondary'
                            )}
                          >
                            <User className="mr-3 h-4 w-4" />
                            Your Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/attendance"
                            className={cn(
                              "flex items-center px-4 py-2 text-sm transition-colors duration-150",
                              active ? 'bg-background-secondary text-text-primary' : 'text-text-secondary'
                            )}
                          >
                            <ClipboardCheck className="mr-3 h-4 w-4" />
                            Mark Attendance
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/history"
                            className={cn(
                              "flex items-center px-4 py-2 text-sm transition-colors duration-150",
                              active ? 'bg-background-secondary text-text-primary' : 'text-text-secondary'
                            )}
                          >
                            <Clock className="mr-3 h-4 w-4" />
                            Attendance History
                          </Link>
                        )}
                      </Menu.Item>
                      {currentUser?.role === 'admin' && (
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/settings"
                              className={cn(
                                "flex items-center px-4 py-2 text-sm transition-colors duration-150",
                                active ? 'bg-background-secondary text-text-primary' : 'text-text-secondary'
                              )}
                            >
                              <Settings className="mr-3 h-4 w-4" />
                              Settings
                            </Link>
                          )}
                        </Menu.Item>
                      )}
                    </div>
                    
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={cn(
                              "flex items-center w-full text-left px-4 py-2 text-sm transition-colors duration-150",
                              active ? 'bg-error-50 text-error-700' : 'text-text-secondary'
                            )}
                          >
                            <LogOut className="mr-3 h-4 w-4" />
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {showSearch && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowSearch(false)} />
            <div className="fixed top-0 left-0 right-0 bg-background-surface p-4">
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-text-muted" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users, events, attendance..."
                  className="block w-full pl-10 pr-10 py-3 border border-border-light rounded-lg 
                           bg-background-primary text-text-primary placeholder-text-muted
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                           text-base"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 pr-3"
                  onClick={() => setShowSearch(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Enhanced Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-background-primary">
          <div className="py-6">
            <div className="container-responsive">
              {/* Enhanced Mobile greeting with status */}
              <div className="lg:hidden mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-heading font-semibold text-text-primary">
                      {greeting}, {currentUser?.name?.split(' ')[0] || 'there'}!
                    </h2>
                    <p className="text-sm text-text-secondary">{formatDate(currentTime)}</p>
                    {upcomingEvents.length > 0 && (
                      <p className="text-xs text-text-muted mt-1">
                        Next: {upcomingEvents[0].name} at {upcomingEvents[0].startTime}
                      </p>
                    )}
                  </div>
                  {todayAttendance && (
                    <div className="flex items-center space-x-2">
                      {getAttendanceStatusIcon(todayAttendance.status)}
                      <Badge 
                        variant={todayAttendance.status === 'present' ? 'success' : 
                               todayAttendance.status === 'late' ? 'warning' : 'destructive'}
                        className="text-xs"
                      >
                        {todayAttendance.status}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Page content with better accessibility */}
              <main id="main-content" className="animate-in" role="main" aria-label="Main content">
                {children}
              </main>
            </div>
          </div>
        </main>
      </div>
    </div>
    </PerformanceMonitor>
  )
}

export default Layout