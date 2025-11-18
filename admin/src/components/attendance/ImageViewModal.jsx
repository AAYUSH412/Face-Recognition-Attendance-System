import { X } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'

const ImageViewModal = ({ imageUrl, isOpen, onClose }) => {
  if (!isOpen || !imageUrl) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Attendance Image</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Close
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex items-center justify-center bg-gray-50 min-h-[400px]">
            <img
              src={imageUrl}
              alt="Attendance verification"
              className="max-w-full max-h-[70vh] object-contain"
              onError={(e) => {
                e.target.src = '/placeholder-image.jpg' // fallback image
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ImageViewModal
