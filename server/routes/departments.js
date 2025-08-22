import express from 'express';
import mongoose from 'mongoose';
import Department from '../models/Department.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// @route   GET api/departments
// @desc    Get all departments
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const departments = await Department.find().populate('head', 'name email');
    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error.message);
    res.status(500).json({ message: 'Server error fetching departments' });
  }
});

// @route   POST api/departments
// @desc    Create a department
// @access  Private/Admin
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, description, code, headId } = req.body;
    
    // Check if department already exists
    const existingDepartment = await Department.findOne({ name });
    if (existingDepartment) {
      return res.status(400).json({ message: 'Department already exists' });
    }
    
    // Check if code already exists (if provided)
    if (code) {
      const existingCode = await Department.findOne({ code: code.toUpperCase() });
      if (existingCode) {
        return res.status(400).json({ message: 'Department code already exists' });
      }
    }
    
    // Create new department
    const newDepartment = new Department({
      name,
      description,
      code: code ? code.toUpperCase() : undefined,
      head: headId || null
    });
    
    const department = await newDepartment.save();
    res.status(201).json(department);
  } catch (error) {
    console.error('Create department error:', error.message);
    res.status(500).json({ message: 'Server error creating department' });
  }
});

// @route   GET api/departments/:id
// @desc    Get single department by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id).populate('head', 'name email');
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    res.json(department);
  } catch (error) {
    console.error('Get department error:', error.message);
    res.status(500).json({ message: 'Server error fetching department' });
  }
});

// @route   PUT api/departments/:id
// @desc    Update a department
// @access  Private/Admin
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { name, description, code, headId, isActive } = req.body;
    
    // Check if code already exists (if provided and different from current)
    if (code) {
      const existingCode = await Department.findOne({ 
        code: code.toUpperCase(),
        _id: { $ne: req.params.id }
      });
      if (existingCode) {
        return res.status(400).json({ message: 'Department code already exists' });
      }
    }
    
    // Build update object
    const updateFields = {};
    if (name) updateFields.name = name;
    if (description !== undefined) updateFields.description = description;
    if (code !== undefined) updateFields.code = code ? code.toUpperCase() : null;
    if (headId) updateFields.head = headId;
    if (isActive !== undefined) updateFields.isActive = isActive;
    
    // Update department
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    ).populate('head', 'name email');
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    res.json(department);
  } catch (error) {
    console.error('Update department error:', error.message);
    res.status(500).json({ message: 'Server error updating department' });
  }
});

// @route   DELETE api/departments/:id
// @desc    Delete a department (soft delete by setting isActive to false)
// @access  Private/Admin
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Soft delete by setting isActive to false
    department.isActive = false;
    await department.save();
    
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Delete department error:', error.message);
    res.status(500).json({ message: 'Server error deleting department' });
  }
});

// @route   GET api/departments/:id/users
// @desc    Get all users in a department
// @access  Private
router.get('/:id/users', auth, async (req, res) => {
  try {
    const User = mongoose.model('User');
    const users = await User.find({ department: req.params.id })
      .select('name email isActive createdAt')
      .sort({ name: 1 });
    
    res.json(users);
  } catch (error) {
    console.error('Get department users error:', error.message);
    res.status(500).json({ message: 'Server error fetching department users' });
  }
});

// @route   GET api/departments/:id/users/count
// @desc    Get count of users in a department
// @access  Private
router.get('/:id/users/count', auth, async (req, res) => {
  try {
    const User = mongoose.model('User');
    const count = await User.countDocuments({ 
      department: req.params.id,
      isActive: true 
    });
    
    res.json({ count });
  } catch (error) {
    console.error('Get department user count error:', error.message);
    res.status(500).json({ message: 'Server error fetching department user count' });
  }
});

// @route   GET api/departments/:id/stats
// @desc    Get department statistics
// @access  Private
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const User = mongoose.model('User');
    const Attendance = mongoose.model('Attendance');
    
    // Get user counts
    const totalUsers = await User.countDocuments({ department: req.params.id });
    const activeUsers = await User.countDocuments({ 
      department: req.params.id, 
      isActive: true 
    });
    
    // Get attendance stats for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const departmentUsers = await User.find({ 
      department: req.params.id 
    }).select('_id');
    
    const userIds = departmentUsers.map(user => user._id);
    
    const attendanceStats = await Attendance.aggregate([
      {
        $match: {
          user: { $in: userIds },
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          totalAttendance: { $sum: 1 },
          uniqueUsers: { $addToSet: '$user' }
        }
      }
    ]);
    
    const stats = {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      attendanceStats: attendanceStats[0] || { 
        totalAttendance: 0, 
        uniqueUsers: [] 
      }
    };
    
    stats.attendanceStats.uniqueUserCount = stats.attendanceStats.uniqueUsers.length;
    delete stats.attendanceStats.uniqueUsers;
    
    res.json(stats);
  } catch (error) {
    console.error('Get department stats error:', error.message);
    res.status(500).json({ message: 'Server error fetching department statistics' });
  }
});

// @route   GET api/departments/export
// @desc    Export departments data as CSV
// @access  Private/Admin
router.get('/export', adminAuth, async (req, res) => {
  try {
    const departments = await Department.find().populate('head', 'name email');
    
    // Convert to CSV format
    const csvData = departments.map(dept => ({
      'Department Name': dept.name,
      'Department Code': dept.code || '',
      'Description': dept.description || '',
      'Head Name': dept.head?.name || '',
      'Head Email': dept.head?.email || '',
      'Status': dept.isActive ? 'Active' : 'Inactive',
      'Created Date': dept.createdAt.toLocaleDateString(),
      'Last Updated': dept.updatedAt.toLocaleDateString()
    }));
    
    res.json(csvData);
  } catch (error) {
    console.error('Export departments error:', error.message);
    res.status(500).json({ message: 'Server error exporting departments' });
  }
});

export default router;