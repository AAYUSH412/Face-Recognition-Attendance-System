import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Check, 
  X, 
  Trash2,
  MapPin,
  Camera,
  Shield
} from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Avatar } from '../ui/Avatar'
import { formatDate } from '../../lib/utils'

const AttendanceRecord = ({ record, onVerify, onReject, onDelete, onViewImage }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4" />
      case 'late':
        return <Clock className="h-4 w-4" />
      case 'absent':
        return <XCircle className="h-4 w-4" />
      default:
        return <XCircle className="h-4 w-4" />
    }
  }

  const getStatusVariant = (status) => {
    switch (status) {
      case 'present':
        return 'success'
      case 'late':
        return 'warning'
      case 'absent':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getVerificationStatus = (record) => {
    const checkInVerified = record.checkIn?.verified !== false
    const checkOutVerified = record.checkOut?.verified !== false
    
    if (checkInVerified && checkOutVerified) {
      return { status: 'verified', label: 'Verified', variant: 'success' }
    } else {
      return { status: 'pending', label: 'Pending', variant: 'warning' }
    }
  }

  const verification = getVerificationStatus(record)

  return (
    <Card className="hover:shadow-medium transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <Avatar name={record.user?.name} size="md" />
            
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-medium">{record.user?.name || 'Unknown User'}</h3>
                <Badge variant={getStatusVariant(record.status)} className="gap-1">
                  {getStatusIcon(record.status)}
                  {record.status}
                </Badge>
                <Badge variant={verification.variant}>
                  {verification.label}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Email:</span> {record.user?.email}
                </div>
                <div>
                  <span className="font-medium">Department:</span> {record.user?.department?.name || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Date:</span> {formatDate(record.date)}
                </div>
                <div>
                  <span className="font-medium">Registration ID:</span> {record.user?.registrationId || 'N/A'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Check In */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Check In</h4>
                  {record.checkIn?.time ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span className="text-sm">{formatDate(record.checkIn.time, 'time')}</span>
                        {record.checkIn.verified === false && (
                          <Badge variant="warning" size="sm">Unverified</Badge>
                        )}
                      </div>
                      {record.checkIn.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span className="text-xs text-muted-foreground">
                            {record.checkIn.location.address}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        {record.checkIn.image && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewImage(record.checkIn.image)}
                            className="gap-1"
                          >
                            <Camera className="h-3 w-3" />
                            View Image
                          </Button>
                        )}
                        {record.checkIn.verified === false && (
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onVerify(record._id, 'checkIn')}
                              className="gap-1 text-green-600"
                            >
                              <Check className="h-3 w-3" />
                              Verify
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onReject(record._id, 'checkIn')}
                              className="gap-1 text-red-600"
                            >
                              <X className="h-3 w-3" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No check-in recorded</p>
                  )}
                </div>

                {/* Check Out */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Check Out</h4>
                  {record.checkOut?.time ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span className="text-sm">{formatDate(record.checkOut.time, 'time')}</span>
                        {record.checkOut.verified === false && (
                          <Badge variant="warning" size="sm">Unverified</Badge>
                        )}
                      </div>
                      {record.checkOut.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span className="text-xs text-muted-foreground">
                            {record.checkOut.location.address}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        {record.checkOut.image && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewImage(record.checkOut.image)}
                            className="gap-1"
                          >
                            <Camera className="h-3 w-3" />
                            View Image
                          </Button>
                        )}
                        {record.checkOut.verified === false && (
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onVerify(record._id, 'checkOut')}
                              className="gap-1 text-green-600"
                            >
                              <Check className="h-3 w-3" />
                              Verify
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onReject(record._id, 'checkOut')}
                              className="gap-1 text-red-600"
                            >
                              <X className="h-3 w-3" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No check-out recorded</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(record._id)}
              className="gap-1 text-red-600"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AttendanceRecord
