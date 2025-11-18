import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AdminAuthProvider } from './context/AdminAuthContext'
import AdminLogin from './pages/AdminLogin'
import AdminPrivateRoute from './components/AdminPrivateRoute'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Attendance from './pages/Attendance'
import Departments from './pages/Departments'
import UserDetail from './pages/UserDetail'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import EventForm from './pages/EventForm'
import EventAttendees from './pages/EventAttendees'
import NotFound from './components/NotFound'

const App = () => {
  return (
    <AdminAuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<AdminLogin />} />
          
          <Route path="/" element={<AdminPrivateRoute />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="users/:id" element={<UserDetail />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="departments" element={<Departments />} />
            <Route path="events" element={<Events />} />
            <Route path="events/new" element={<EventForm />} />
            <Route path="events/:id" element={<EventDetail />} />
            <Route path="events/:id/edit" element={<EventForm />} />
            <Route path="events/:id/attendees" element={<EventAttendees />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AdminAuthProvider>
  )
}

export default App