import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext.jsx'
import PrivateRoute from './components/PrivateRoute'
import Login from './Auth/Login'
import Register from './Auth/Register.jsx'
import Dashboard from './components/Dashboard'
import AttendanceCapture from './components/AttendanceCapture'
import AttendanceHistory from './components/AttendanceHistory'
import Profile from './components/Profile'
import NotFound from './components/NotFound'

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<PrivateRoute />}>
            <Route index element={<Dashboard />} />
            <Route path="mark-attendance" element={<AttendanceCapture />} />
            <Route path="history" element={<AttendanceHistory />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App