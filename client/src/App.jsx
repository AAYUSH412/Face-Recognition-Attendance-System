import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import PrivateRoute from './components/PrivateRoute'
import Login from './Auth/Login'
import Register from './Auth/Register.jsx'
import EnhancedDashboard from './components/Dashboard.jsx'
import AttendanceCapture from './components/AttendanceCapture'
import AttendanceHistory from './components/AttendanceHistory'
import Profile from './components/Profile'
import Events from './components/Events'
import NotFound from './components/NotFound'

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<PrivateRoute />}>
            <Route index element={<EnhancedDashboard />} />
            <Route path="attendance" element={<AttendanceCapture />} />
            <Route path="history" element={<AttendanceHistory />} />
            <Route path="events" element={<Events />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  </ThemeProvider>
  )
}

export default App