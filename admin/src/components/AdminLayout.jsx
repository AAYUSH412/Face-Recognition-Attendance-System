import { Fragment, useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Dialog, Menu, Transition } from '@headlessui/react'
import {
  HomeIcon,
  UsersIcon,
  ClockIcon,
  BuildingOfficeIcon,
  XMarkIcon,
  Bars3Icon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '../context/AdminAuthContext'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon, description: 'Overview of system statistics' },
  { name: 'Users', href: '/users', icon: UsersIcon, description: 'Manage users and permissions' },
  { name: 'Attendance Records', href: '/attendance', icon: ClockIcon, description: 'View and manage attendance data' },
  { name: 'Departments', href: '/departments', icon: BuildingOfficeIcon, description: 'Organize users by department' },
  { name: 'Events', href: '/events', icon: CalendarIcon, description: 'Manage events and attendance' },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { currentAdmin, logout } = useAdminAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => {
      clearInterval(timer);
    };
  }, []);
  
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  
  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
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
            <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white">
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
                <div className="flex items-center">
                  <div className="bg-purple-600 p-2 rounded-md">
                    <BuildingOfficeIcon className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-xl font-bold text-purple-600 ml-2">Admin Panel</h1>
                </div>
              </div>
              
              {/* Admin info mobile */}
              {currentAdmin && (
                <div className="mt-5 px-4">
                  <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg">
                      {currentAdmin?.name?.charAt(0) || 'A'}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-700">{currentAdmin?.name || 'Admin User'}</p>
                      <p className="text-xs text-gray-500 truncate">{currentAdmin?.email || 'admin@example.com'}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-5 flex-1 h-0 overflow-y-auto">
                <nav className="px-2 space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={classNames(
                        item.href === location.pathname || (item.href !== '/' && location.pathname.startsWith(item.href))
                          ? 'bg-purple-50 text-purple-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                        'group flex items-center px-2 py-3 text-base font-medium rounded-md transition-colors duration-150'
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon
                        className={classNames(
                          item.href === location.pathname || (item.href !== '/' && location.pathname.startsWith(item.href))
                            ? 'text-purple-500'
                            : 'text-gray-400 group-hover:text-gray-500',
                          'mr-4 flex-shrink-0 h-6 w-6 transition-colors duration-150'
                        )}
                        aria-hidden="true"
                      />
                      <div>
                        <div>{item.name}</div>
                        {item.description && (
                          <p className="text-xs text-gray-500 group-hover:text-gray-600">{item.description}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </nav>
                
                <div className="mt-10 pt-6 border-t border-gray-200 px-2">
                  <button
                    onClick={handleLogout}
                    className="group flex items-center px-2 py-3 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full transition-colors duration-150"
                  >
                    <ArrowRightOnRectangleIcon className="mr-4 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                    Sign out
                  </button>
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
          <div className="flex flex-col h-0 flex-1">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-white border-b border-gray-200">
              <div className="flex items-center">
                <div className="bg-purple-600 p-2 rounded-md">
                  <BuildingOfficeIcon className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-purple-600 ml-2">Admin Panel</h1>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col overflow-y-auto">
              {/* Admin info desktop */}
              {currentAdmin && (
                <div className="px-4 py-4 bg-white border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg">
                      {currentAdmin?.name?.charAt(0) || 'A'}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-700">{currentAdmin?.name || 'Admin User'}</p>
                      <p className="text-xs text-gray-500 truncate">{currentAdmin?.email || 'admin@example.com'}</p>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    {formatDate(currentTime)}
                  </div>
                </div>
              )}
              
              <nav className="flex-1 px-2 py-4 bg-white space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={classNames(
                      item.href === location.pathname || (item.href !== '/' && location.pathname.startsWith(item.href))
                        ? 'bg-purple-50 text-purple-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150'
                    )}
                  >
                    <item.icon
                      className={classNames(
                        item.href === location.pathname || (item.href !== '/' && location.pathname.startsWith(item.href))
                          ? 'text-purple-500'
                          : 'text-gray-400 group-hover:text-gray-500',
                        'mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-150'
                      )}
                      aria-hidden="true"
                    />
                    <div>
                      <div>{item.name}</div>
                      {item.description && (
                        <p className="text-xs text-gray-500 group-hover:text-gray-600">{item.description}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </nav>
              
              <div className="mt-auto border-t border-gray-200 p-4">
                <button
                  onClick={handleLogout}
                  className="group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150"
                >
                  <ArrowRightOnRectangleIcon className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                  Sign out
                </button>
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
            className="px-4 border-r border-gray-200 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          
          <div className="flex-1 px-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-800">
                {navigation.find(item => item.href === location.pathname || 
                                (item.href !== '/' && location.pathname.startsWith(item.href)))?.name || 'Dashboard'}
              </h2>
            </div>
            
            <div className="ml-4 flex items-center md:ml-6">
              <button
                type="button"
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 mr-3"
              >
                <span className="sr-only">Settings</span>
                <Cog6ToothIcon className="h-6 w-6" aria-hidden="true" />
              </button>
              
              {/* Profile dropdown */}
              <Menu as="div" className="ml-3 relative">
                <div>
                  <Menu.Button className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                      {currentAdmin?.name?.charAt(0) || 'A'}
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
                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100">
                    <div className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">Signed in as</p>
                      <p className="text-sm text-gray-700 font-medium mt-1">{currentAdmin?.name}</p>
                      <p className="text-sm text-gray-500 truncate">{currentAdmin?.email}</p>
                    </div>
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={classNames(
                              active ? 'bg-gray-100' : '',
                              'flex w-full text-left px-4 py-2 text-sm text-gray-700 items-center'
                            )}
                          >
                            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400" />
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

        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-50">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {/* Breadcrumb could be added here */}
              <div className="bg-white p-5 rounded-lg shadow mb-6">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout