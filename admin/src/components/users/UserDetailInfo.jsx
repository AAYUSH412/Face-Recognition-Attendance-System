import { User, Mail, IdCard, Building2, Shield, Calendar } from 'lucide-react'
import { Card } from '../ui/Card'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'

const UserDetailInfo = ({ user }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const getRoleBadgeVariant = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'destructive'
      case 'manager': return 'default'
      case 'user': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-start gap-6">
        <Avatar className="w-24 h-24">
          <div className="w-full h-full bg-blue-100 flex items-center justify-center">
            <User className="w-12 h-12 text-blue-600" />
          </div>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600 mt-1">{user.email}</p>
              
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  <Shield className="w-3 h-3 mr-1" />
                  {user.role || 'User'}
                </Badge>
                
                {user.registrationId && (
                  <Badge variant="outline">
                    <IdCard className="w-3 h-3 mr-1" />
                    ID: {user.registrationId}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Email</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
            
            {user.department && (
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Department</p>
                  <p className="text-sm text-gray-600">
                    {typeof user.department === 'object' ? user.department.name : user.department}
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Joined</p>
                <p className="text-sm text-gray-600">{formatDate(user.createdAt)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Last Updated</p>
                <p className="text-sm text-gray-600">{formatDate(user.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default UserDetailInfo
