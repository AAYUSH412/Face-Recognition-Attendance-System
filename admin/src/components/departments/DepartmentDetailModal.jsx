import { X, Building2, Users, Calendar, MapPin, User, Hash, Activity } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { formatDate } from '../../lib/utils'

const DepartmentDetailModal = ({ 
  isOpen, 
  onClose, 
  department = null,
  userCount = 0,
  onEdit
}) => {
  if (!isOpen || !department) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{department.name}</h2>
              {department.code && (
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Hash className="h-3 w-3 mr-1" />
                  {department.code}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => onEdit(department)}
              className="text-blue-600 hover:text-blue-700"
            >
              Edit Department
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Activity className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge 
                      variant={department.isActive ? "default" : "secondary"}
                      className="mt-1"
                    >
                      {department.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Total Employees</p>
                    <p className="text-xl font-semibold text-gray-900">{userCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(department.createdAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          {department.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{department.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location */}
            {department.location && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Location</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{department.location}</p>
                </CardContent>
              </Card>
            )}

            {/* Manager */}
            {department.manager && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Department Manager</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 font-medium">{department.manager}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Department ID</p>
                  <p className="text-sm font-mono text-gray-700">{department._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="text-sm text-gray-700">
                    {formatDate(department.updatedAt || department.createdAt)}
                  </p>
                </div>
                {department.code && (
                  <div>
                    <p className="text-sm text-gray-500">Department Code</p>
                    <p className="text-sm font-medium text-gray-700">{department.code}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Active Status</p>
                  <p className="text-sm text-gray-700">
                    {department.isActive ? 'Currently Active' : 'Currently Inactive'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics (Placeholder for future implementation) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Department Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{userCount}</p>
                  <p className="text-sm text-blue-700">Total Members</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {Math.floor(userCount * 0.8)}
                  </p>
                  <p className="text-sm text-green-700">Active Today</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.floor(userCount * 0.15)}
                  </p>
                  <p className="text-sm text-purple-700">Faculty</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => onEdit(department)} className="bg-blue-600 hover:bg-blue-700">
              Edit Department
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentDetailModal;
