import { Navigate, Outlet } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'
import AdminLayout from './AdminLayout'

const AdminPrivateRoute = () => {
  const { isAuthenticated, loading } = useAdminAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mb-4"></div>
        <p className="text-gray-600 text-lg font-medium">Loading admin panel...</p>
        <p className="text-gray-500 text-sm mt-2">Please wait while we verify your credentials</p>
      </div>
    )
  }
  
  return isAuthenticated ? (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  ) : (
    <Navigate to="/login" replace />
  )
}

export default AdminPrivateRoute