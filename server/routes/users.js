import express from 'express';
import User from '../models/User.js';
import { auth, adminAuth } from '../middleware/auth.js';
import imagekit from '../utils/imagekit.js';

const router = express.Router();

// @route   PATCH api/users/bulk-status
// @desc    Bulk update user status (Admin only)
// @access  Private/Admin
router.patch('/bulk-status', adminAuth, async (req, res) => {
  try {
    const { userIds, isActive } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'User IDs array is required' });
    }
    
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be a boolean value' });
    }
    
    // Update multiple users
    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { isActive }
    );
    
    res.json({
      message: `Successfully ${isActive ? 'activated' : 'deactivated'} ${result.modifiedCount} users`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk status update error:', error.message);
    res.status(500).json({ message: 'Server error updating user statuses' });
  }
});

// @route   GET api/users/stats
// @desc    Get user statistics (Admin only)
// @access  Private/Admin
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const usersWithFaceData = await User.countDocuments({
      'faceData.0': { $exists: true }
    });
    
    const recentUsers = await User.countDocuments({
      createdAt: {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    });
    
    res.json({
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
      byRole: usersByRole.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      withFaceData: usersWithFaceData,
      recentSignups: recentUsers
    });
  } catch (error) {
    console.error('Get user stats error:', error.message);
    res.status(500).json({ message: 'Server error fetching user statistics' });
  }
});

// @route   GET api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('department', 'name');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error.message);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Private/Admin
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('department', 'name');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error fetching user' });
  }
});

// @route   POST api/users
// @desc    Create a new user (Admin only)
// @access  Private/Admin
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, email, password, role, departmentId, registrationId } = req.body;

    // Check if user already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Check if registration ID already exists (for students)
    if (registrationId) {
      const existingRegId = await User.findOne({ registrationId });
      if (existingRegId) {
        return res.status(400).json({ message: 'User already exists with this registration ID' });
      }
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: role || 'student',
      department: departmentId || null,
      registrationId: registrationId || null
    });

    await user.save();

    // Return user data without password
    const userData = await User.findById(user._id).select('-password').populate('department', 'name');
    
    res.status(201).json({
      message: 'User created successfully',
      user: userData
    });
  } catch (error) {
    console.error('Create user error:', error.message);
    res.status(500).json({ message: 'Server error creating user' });
  }
});

// @route   POST api/users/face
// @desc    Add face data for user
// @access  Private
router.post('/face', auth, async (req, res) => {
  try {
    const { base64Image } = req.body;
    
    if (!base64Image) {
      return res.status(400).json({ message: 'No image provided' });
    }
    
    // Upload image to ImageKit
    const uploadResponse = await imagekit.upload({
      file: base64Image,
      fileName: `face_${req.user.id}_${Date.now()}.jpg`,
      folder: '/face-recognition/'
    });
    
    // Add face data to user
    const user = await User.findById(req.user.id);
    user.faceData.push({
      imageId: uploadResponse.fileId,
      imageUrl: uploadResponse.url,
      imageKit_id: uploadResponse.fileId
    });
    
    await user.save();
    
    res.json({ 
      message: 'Face data added successfully',
      faceData: user.faceData
    });
  } catch (error) {
    console.error('Add face data error:', error.message);
    res.status(500).json({ message: 'Server error adding face data' });
  }
});

// @route   DELETE api/users/face/:imageId
// @desc    Delete face data
// @access  Private
router.delete('/face/:imageId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Find the face data
    const faceDataIndex = user.faceData.findIndex(
      data => data.imageId === req.params.imageId
    );
    
    if (faceDataIndex === -1) {
      return res.status(404).json({ message: 'Face data not found' });
    }
    
    // Delete from ImageKit
    await imagekit.deleteFile(user.faceData[faceDataIndex].imageKit_id);
    
    // Remove from user document
    user.faceData.splice(faceDataIndex, 1);
    await user.save();
    
    res.json({ message: 'Face data deleted successfully' });
  } catch (error) {
    console.error('Delete face data error:', error.message);
    res.status(500).json({ message: 'Server error deleting face data' });
  }
});

// @route   PUT api/users/:id
// @desc    Update user profile (Admin only)
// @access  Private/Admin
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { name, email, role, registrationId, departmentId } = req.body;
    
    // Validate input
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }
    
    // Find user
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if email is being changed and if it already exists
    if (email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }
    
    // Check if registrationId is being changed and if it already exists
    if (registrationId && registrationId !== user.registrationId) {
      const existingRegId = await User.findOne({ 
        registrationId, 
        _id: { $ne: req.params.id } 
      });
      if (existingRegId) {
        return res.status(400).json({ message: 'Registration ID already exists' });
      }
    }
    
    // Update user fields
    user.name = name;
    user.email = email;
    if (role) user.role = role;
    if (registrationId) user.registrationId = registrationId;
    if (departmentId) user.department = departmentId;
    
    await user.save();
    
    // Return updated user with populated department
    const updatedUser = await User.findById(user._id)
      .select('-password')
      .populate('department', 'name');
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error updating user' });
  }
});

// @route   PATCH api/users/:id/status
// @desc    Toggle user active status (Admin only)
// @access  Private/Admin
router.patch('/:id/status', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Toggle the isActive status
    user.isActive = !user.isActive;
    await user.save();
    
    // Return updated user with populated department
    const updatedUser = await User.findById(user._id)
      .select('-password')
      .populate('department', 'name');
    
    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Toggle user status error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error updating user status' });
  }
});

// @route   PUT api/users/:id/password
// @desc    Reset user password (Admin only)
// @access  Private/Admin
router.put('/:id/password', adminAuth, async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    // Validate input
    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
    }
    
    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    // Find user
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error resetting password' });
  }
});

// @route   DELETE api/users/:id
// @desc    Delete user (Admin only)
// @access  Private/Admin
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete all face images from ImageKit before deleting user
    if (user.faceData && user.faceData.length > 0) {
      try {
        for (const faceItem of user.faceData) {
          if (faceItem.imageKit_id) {
            await imagekit.deleteFile(faceItem.imageKit_id);
          }
        }
      } catch (imageError) {
        console.error('Error deleting face images from ImageKit:', imageError);
        // Continue with user deletion even if image deletion fails
      }
    }
    
    // Delete the user
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error deleting user' });
  }
});

// @route   PUT api/users/password
// @desc    Change user password
// @access  Private
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new password are required' });
    }
    
    // Find user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if current password is correct
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error.message);
    res.status(500).json({ message: 'Server error changing password' });
  }
});

export default router;