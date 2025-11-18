import { Trash2, Key, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card } from '../ui/Card'

const UserActions = ({ 
  user, 
  onDelete, 
  onPasswordReset,
  showDeleteConfirm,
  setShowDeleteConfirm,
  showPasswordReset,
  setShowPasswordReset,
  newPassword,
  setNewPassword,
  resetting 
}) => {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await onDelete()
    } finally {
      setDeleting(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!newPassword.trim()) return
    await onPasswordReset(newPassword)
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">User Actions</h2>
      
      <div className="space-y-4">
        {/* Password Reset */}
        <div>
          <Button
            variant="outline"
            onClick={() => setShowPasswordReset(!showPasswordReset)}
            className="w-full"
          >
            <Key className="w-4 h-4 mr-2" />
            Reset Password
          </Button>
          
          {showPasswordReset && (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="flex gap-2">
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="flex-1"
                />
                <Button
                  onClick={handlePasswordReset}
                  disabled={!newPassword.trim() || resetting}
                  size="sm"
                >
                  {resetting ? 'Resetting...' : 'Reset'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Delete User */}
        <div>
          <Button
            variant="outline"
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full text-red-600 hover:text-red-800 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete User
          </Button>
          
          {showDeleteConfirm && (
            <div className="mt-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="text-sm font-medium text-red-800">Confirm Deletion</h3>
              </div>
              
              <p className="text-sm text-red-700 mb-4">
                Are you sure you want to delete <strong>{user.name}</strong>? 
                This action cannot be undone and will remove all user data including attendance records.
              </p>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={deleting}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {deleting ? 'Deleting...' : 'Delete User'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export default UserActions
