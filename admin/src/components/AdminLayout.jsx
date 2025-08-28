import { Fragment, useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Dialog, Menu, Transition } from '@headlessui/react'
import {
  LayoutDashboard,
  Users,
  Clock,
  Building2,
  X,
  Menu as MenuIcon,
  LogOut,
  Settings,
  Calendar,
  ChevronDown,
  Bell,
  Search,
  Command
} from 'lucide-react'
import { useAdminAuth } from '../context/AdminAuthContext'
import { Avatar } from './ui/Avatar'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Badge } from './ui/Badge'
import { cn } from '../lib/utils'

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/', 
    icon: LayoutDashboard, 
    description: 'Overview of system statistics',
  },
  { 
    name: 'Users', 
    href: '/users', 
    icon: Users, 
    description: 'Manage users and permissions' 
  },
  { 
    name: 'Attendance Records', 
    href: '/attendance', 
    icon: Clock, 
    description: 'View and manage attendance data' 
  },
  { 
    name: 'Departments', 
    href: '/departments', 
    icon: Building2, 
    description: 'Organize users by department' 
  },
  { 
    name: 'Events', 
    href: '/events', 
    icon: Calendar, 
    description: 'Manage events and attendance' 
  },
]

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

  // Update navigation current state based on location
  const updatedNavigation = navigation.map(item => ({
    ...item,
    current: location.pathname === item.href || 
             (item.href !== '/' && location.pathname.startsWith(item.href))
  }))
  
  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50 lg:hidden"
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
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <X className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                
                {/* Mobile sidebar content */}
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center">
                    <img
                      className="h-8 w-auto"
                      src="/Face Recognition Attendance System-logo.png"
                      alt="Face Recognition Attendance System"
                    />
                    <span className="ml-3 text-lg font-semibold text-gray-900">
                      Admin Panel
                    </span>
                  </div>
                  
                  {/* Admin info mobile */}
                  {currentAdmin && (
                    <div className="rounded-lg bg-slate-500 p-4">
                      <div className="flex items-center">
                        <Avatar 
                          name={currentAdmin?.name} 
                          className="h-10 w-10" 
                        />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {currentAdmin?.name || 'Admin User'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {currentAdmin?.email || 'admin@example.com'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {updatedNavigation.map((item) => (
                            <li key={item.name}>
                              <Link
                                to={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={cn(
                                  item.current
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                                  'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 transition-colors'
                                )}
                              >
                                <item.icon
                                  className={cn(
                                    item.current ? 'text-primary-foreground' : 'text-gray-400 group-hover:text-gray-900',
                                    'h-6 w-6 shrink-0'
                                  )}
                                  aria-hidden="true"
                                />
                                <span className="truncate">{item.name}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                      <li className="mt-auto">
                        <button
                          onClick={handleLogout}
                          className="group -mx-2 flex w-full gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        >
                          <LogOut
                            className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-gray-900"
                            aria-hidden="true"
                          />
                          Sign out
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <img
              className="h-8 w-auto"
              src="/Face Recognition Attendance System-logo.png"
              alt="Face Recognition Attendance System"
            />
            <span className="ml-3 text-lg font-semibold text-gray-900">
              Admin Panel
            </span>
          </div>
          
          {/* Admin info desktop */}
          {currentAdmin && (
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center">
                <Avatar 
                  name={currentAdmin?.name} 
                  className="h-10 w-10" 
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {currentAdmin?.name || 'Admin User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {currentAdmin?.email || 'admin@example.com'}
                  </p>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                {formatDate(currentTime)}
              </div>
            </div>
          )}
          
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {updatedNavigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={cn(
                          item.current
                            ? 'bg-primary text-primary-foreground'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                          'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 transition-colors'
                        )}
                      >
                        <item.icon
                          className={cn(
                            item.current ? 'text-primary-foreground' : 'text-gray-400 group-hover:text-gray-900',
                            'h-6 w-6 shrink-0'
                          )}
                          aria-hidden="true"
                        />
                        <div>
                          <div className="truncate">{item.name}</div>
                          {item.description && (
                            <p className={cn(
                              "text-xs mt-0.5",
                              item.current 
                                ? "text-primary-foreground/80" 
                                : "text-gray-500 group-hover:text-gray-700"
                            )}>
                              {item.description}
                            </p>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto">
                <button
                  onClick={handleLogout}
                  className="group -mx-2 flex w-full gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                >
                  <LogOut
                    className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-gray-900"
                    aria-hidden="true"
                  />
                  Sign out
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <MenuIcon className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Separator */}
          <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1 items-center">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-gray-900">
                  {updatedNavigation.find(item => item.current)?.name || 'Dashboard'}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">View notifications</span>
                <Bell className="h-6 w-6" aria-hidden="true" />
              </button>

              {/* Separator */}
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

              {/* Profile dropdown */}
              <Menu as="div" className="relative">
                <Menu.Button className="-m-1.5 flex items-center p-1.5">
                  <span className="sr-only">Open user menu</span>
                  <Avatar 
                    name={currentAdmin?.name}
                    size="sm"
                  />
                  <span className="hidden lg:flex lg:items-center">
                    <span className="ml-4 text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">
                      {currentAdmin?.name || 'Admin'}
                    </span>
                    <ChevronDown className="ml-2 h-5 w-5 text-gray-400" aria-hidden="true" />
                  </span>
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={cn(
                            active ? 'bg-gray-50' : '',
                            'block w-full px-3 py-1 text-left text-sm leading-6 text-gray-900'
                          )}
                        >
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout