import { Fragment, useState, useEffect } from 'react'
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
  MagnifyingGlassIcon
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
  X
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button, EnhancedAvatar, ThemeToggle, SkipLink, AccessibilityButton, PerformanceMonitor } from './ui'
import { cn } from '../lib/utils'

// Updated navigation with new design
const navigation = [
  { 
    name: 'Dashboard', 
    href: '/', 
    icon: HomeIcon, 
    lucideIcon: Home,
    description: 'Overview of your attendance',
    color: 'text-primary-600'
  },
  { 
    name: 'Mark Attendance', 
    href: '/attendance', 
    icon: ClipboardDocumentCheckIcon, 
    lucideIcon: ClipboardCheck,
    description: 'Face, Manual, or QR attendance',
    color: 'text-secondary-600'
  },
  { 
    name: 'Attendance History', 
    href: '/history', 
    icon: ClockIcon, 
    lucideIcon: Clock,
    description: 'View past attendance records',
    color: 'text-accent-600'
  },
  { 
    name: 'Events', 
    href: '/events', 
    icon: CalendarIcon, 
    lucideIcon: Calendar,
    description: 'View and join events',
    color: 'text-purple-600'
  },
  { 
    name: 'Profile', 
    href: '/profile', 
    icon: UserIcon, 
    lucideIcon: User,
    description: 'Manage your account',
    color: 'text-emerald-600'
  },
]

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { currentUser, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [greeting, setGreeting] = useState('')
  
  // Update time and greeting
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute
    
    updateGreeting()
    
    return () => clearInterval(intervalId)
  }, [])
  
  const updateGreeting = () => {
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
  }
  
  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }
  
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    })
  }

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
            <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
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
                {/* User Profile Section */}
                {currentUser && (
                  <div className="px-6 py-4 border-b border-border-light">
                    <div className="flex items-center space-x-3">
                      <EnhancedAvatar 
                        name={currentUser?.name}
                        size="lg"
                        className="ring-2 ring-primary-200"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {currentUser?.name || 'User'}
                        </p>
                        <p className="text-xs text-text-secondary truncate">
                          {currentUser?.email || 'user@example.com'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
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
              {/* User Profile Section */}
              {currentUser && (
                <div className="px-6 py-4 border-b border-border-light">
                  <div className="flex items-center space-x-3">
                    <EnhancedAvatar 
                      name={currentUser?.name}
                      size="lg"
                      className="ring-2 ring-primary-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {currentUser?.name || 'User'}
                      </p>
                      <p className="text-xs text-text-secondary truncate">
                        {currentUser?.email || 'user@example.com'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
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
              
              {/* Greeting */}
              <div className="hidden md:block">
                <h2 className="text-xl font-heading font-semibold text-text-primary">
                  {greeting}, {currentUser?.name?.split(' ')[0] || 'there'}!
                </h2>
              </div>
            </div>
            
            {/* Right side actions */}
            <div className="flex items-center space-x-2">              
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="text-text-muted hover:text-text-primary relative">
                <span className="sr-only">View notifications</span>
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-error-500 rounded-full"></span>
              </Button>
              
              {/* Profile dropdown */}
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
                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-strong bg-background-surface ring-1 ring-border-light focus:outline-none divide-y divide-border-light">
                    <div className="py-3 px-4">
                      <p className="text-sm font-medium text-text-primary">Signed in as</p>
                      <p className="text-sm text-text-secondary truncate">{currentUser?.email}</p>
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

        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-background-primary">
          <div className="py-6">
            <div className="container-responsive">
              {/* Mobile greeting */}
              <div className="lg:hidden mb-6">
                <h2 className="text-xl font-heading font-semibold text-text-primary">
                  {greeting}, {currentUser?.name?.split(' ')[0] || 'there'}!
                </h2>
                <p className="text-sm text-text-secondary">{formatDate(currentTime)}</p>
              </div>
              
              {/* Page content */}
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