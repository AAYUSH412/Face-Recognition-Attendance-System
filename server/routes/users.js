import express from 'express';
import User from '../models/User.js';
import { auth, adminAuth } from '../middleware/auth.js';
import imagekit from '../utils/imagekit.js';

const router = express.Router();

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

export default router;