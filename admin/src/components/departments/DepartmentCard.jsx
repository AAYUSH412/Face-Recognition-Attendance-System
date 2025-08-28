import { Building2, Users, Edit, Trash2, Eye, Hash } from "lucide-react";
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { formatDate } from '../../lib/utils'

const DepartmentCard = ({ department, userCount, onEdit, onDelete, onViewDetails }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{department.name}</h3>
              {department.code && (
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Hash className="h-3 w-3 mr-1" />
                  {department.code}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(department)}
              className="p-2"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(department)}
              className="p-2"
              title="Edit Department"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(department._id)}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Delete Department"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {department.description && (
          <p className="text-gray-600 mt-3 text-sm line-clamp-2">{department.description}</p>
        )}

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-500">
              <Users className="h-4 w-4 mr-1" />
              <span>{userCount || 0} employees</span>
            </div>
            
            {department.location && (
              <Badge variant="secondary" className="text-xs">
                {department.location}
              </Badge>
            )}
          </div>

          <div className="text-xs text-gray-400">
            Created {formatDate(department.createdAt)}
          </div>
        </div>

        {/* Department Status */}
        <div className="mt-3 flex items-center justify-between">
          <Badge 
            variant={department.isActive ? "default" : "secondary"}
            className="text-xs"
          >
            {department.isActive ? "Active" : "Inactive"}
          </Badge>
          
          {department.manager && (
            <div className="text-sm text-gray-600">
              Manager: <span className="font-medium">{department.manager}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DepartmentCard;
