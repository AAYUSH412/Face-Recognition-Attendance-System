import { Fragment, useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Dialog, Menu, Transition } from '@headlessui/react'
import {
  HomeIcon,
  CameraIcon,
  ClockIcon,
  UserIcon,
  XMarkIcon,
  Bars3Icon,
  BellIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon, description: 'Overview of your attendance' },
  { name: 'Mark Attendance', href: '/mark-attendance', icon: CameraIcon, description: 'Check in or check out' },
  { name: 'Attendance History', href: '/history', icon: ClockIcon, description: 'View past attendance records' },
  { name: 'Profile', href: '/profile', icon: UserIcon, description: 'Manage your account' },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

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
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 flex z-40 md:hidden"
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
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gradient-to-b from-indigo-700 to-indigo-900 pt-5 pb-4">
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
                  <button
                    type="button"
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              <div className="flex-shrink-0 flex items-center px-4">
                <div className="flex items-center justify-center">
                  <CalendarIcon className="h-8 w-8 text-white" />
                  <h1 className="text-xl font-bold text-white ml-2">FR Attendance</h1>
                </div>
              </div>
              <div className="mt-5 flex-1 h-0 overflow-y-auto">
                <div className="px-2 space-y-1">
                  {currentUser && (
                    <div className="mb-6 px-3 py-3 rounded-lg bg-indigo-800 bg-opacity-50">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-white text-indigo-700 flex items-center justify-center font-bold text-lg">
                          {currentUser?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-white">{currentUser?.name || 'User'}</p>
                          <p className="text-xs text-indigo-200 truncate">{currentUser?.email || 'user@example.com'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={classNames(
                        item.href === location.pathname
                          ? 'bg-indigo-800 text-white'
                          : 'text-indigo-100 hover:bg-indigo-800 hover:text-white',
                        'group flex items-center px-3 py-3 text-base font-medium rounded-md'
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon
                        className={classNames(
                          item.href === location.pathname
                            ? 'text-white'
                            : 'text-indigo-300 group-hover:text-white',
                          'mr-4 flex-shrink-0 h-6 w-6'
                        )}
                        aria-hidden="true"
                      />
                      <div>
                        <div>{item.name}</div>
                        <p className="text-xs text-indigo-300 group-hover:text-indigo-200">{item.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="mt-10 pt-6 border-t border-indigo-800">
                  <div className="px-2">
                    <button
                      onClick={handleLogout}
                      className="group flex items-center px-3 py-3 text-base font-medium rounded-md text-indigo-100 hover:bg-indigo-800 hover:text-white w-full"
                    >
                      <ArrowRightOnRectangleIcon className="mr-4 flex-shrink-0 h-6 w-6 text-indigo-300 group-hover:text-white" />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
          <div className="flex-shrink-0 w-14" aria-hidden="true">
            {/* Force sidebar to shrink to fit close icon */}
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-gradient-to-b from-indigo-700 to-indigo-900">
            <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
              <div className="flex items-center justify-center flex-shrink-0 px-4 mb-5">
                <CalendarIcon className="h-8 w-8 text-white" />
                <h1 className="text-lg font-bold text-white ml-2">Attendance System</h1>
              </div>
              
              {currentUser && (
                <div className="mx-3 mb-6 px-3 py-3 rounded-lg bg-indigo-800 bg-opacity-50">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-white text-indigo-700 flex items-center justify-center font-bold text-lg">
                      {currentUser?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-white">{currentUser?.name || 'User'}</p>
                      <p className="text-xs text-indigo-200 truncate">{currentUser?.email || 'user@example.com'}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <nav className="flex-1 px-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={classNames(
                      item.href === location.pathname
                        ? 'bg-indigo-800 text-white'
                        : 'text-indigo-100 hover:bg-indigo-800 hover:text-white',
                      'group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors duration-150'
                    )}
                  >
                    <item.icon
                      className={classNames(
                        item.href === location.pathname
                          ? 'text-white'
                          : 'text-indigo-300 group-hover:text-white',
                        'mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-150'
                      )}
                      aria-hidden="true"
                    />
                    <div>
                      <div>{item.name}</div>
                      <p className="text-xs text-indigo-300 group-hover:text-indigo-200">{item.description}</p>
                    </div>
                  </Link>
                ))}
              </nav>
              
              <div className="mt-auto pt-4 border-t border-indigo-800 mx-3">
                <div className="px-2">
                  <button
                    onClick={handleLogout}
                    className="group flex items-center px-3 py-3 text-sm font-medium rounded-md text-indigo-100 hover:bg-indigo-800 hover:text-white w-full transition-colors duration-150"
                  >
                    <ArrowRightOnRectangleIcon className="mr-3 flex-shrink-0 h-5 w-5 text-indigo-300 group-hover:text-white" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          
          <div className="flex-1 px-4 flex items-center justify-between">
            <div className="flex-1 flex">
              <div className="ml-2 hidden sm:flex flex-col justify-center">
                <div className="text-xs text-gray-500">{formatDate(currentTime)}</div>
                <div className="text-sm font-medium">{formatTime(currentTime)}</div>
              </div>
              <div className="hidden md:block ml-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  {greeting}, {currentUser?.name?.split(' ')[0] || 'there'}!
                </h2>
              </div>
            </div>
            
            <div className="flex items-center">
              <button
                type="button"
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
              >
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" aria-hidden="true" />
              </button>
              
              <Link
                to="/profile"
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
              >
                <span className="sr-only">Settings</span>
                <Cog6ToothIcon className="h-6 w-6" aria-hidden="true" />
              </Link>
              
              {/* Profile dropdown */}
              <Menu as="div" className="relative">
                <div>
                  <Menu.Button className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <span className="sr-only">Open user menu</span>
                    <div className="h-9 w-9 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center">
                      {currentUser?.name?.charAt(0) || 'U'}
                    </div>
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
                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100">
                    <div className="py-3 px-4">
                      <p className="text-sm font-medium text-gray-900">Signed in as</p>
                      <p className="text-sm text-gray-500 truncate">{currentUser?.email}</p>
                    </div>
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={classNames(
                              active ? 'bg-gray-100' : '',
                              'flex items-center px-4 py-2 text-sm text-gray-700'
                            )}
                          >
                            <UserIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                            Your Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/mark-attendance"
                            className={classNames(
                              active ? 'bg-gray-100' : '',
                              'flex items-center px-4 py-2 text-sm text-gray-700'
                            )}
                          >
                            <CameraIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
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
                            className={classNames(
                              active ? 'bg-gray-100' : '',
                              'flex items-center w-full text-left px-4 py-2 text-sm text-gray-700'
                            )}
                          >
                            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
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

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {/* Page header with mobile greeting */}
              <div className="md:hidden mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  {greeting}, {currentUser?.name?.split(' ')[0] || 'there'}!
                </h2>
                <p className="text-sm text-gray-500">{formatDate(currentTime)}</p>
              </div>
              
              {/* Main content */}
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout