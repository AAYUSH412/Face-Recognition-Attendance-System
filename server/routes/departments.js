import express from 'express';
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
    const { name, description, headId } = req.body;
    
    // Check if department already exists
    const existingDepartment = await Department.findOne({ name });
    if (existingDepartment) {
      return res.status(400).json({ message: 'Department already exists' });
    }
    
    // Create new department
    const newDepartment = new Department({
      name,
      description,
      head: headId || null
    });
    
    const department = await newDepartment.save();
    res.status(201).json(department);
  } catch (error) {
    console.error('Create department error:', error.message);
    res.status(500).json({ message: 'Server error creating department' });
  }
});

// @route   PUT api/departments/:id
// @desc    Update a department
// @access  Private/Admin
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { name, description, headId, isActive } = req.body;
    
    // Build update object
    const updateFields = {};
    if (name) updateFields.name = name;
    if (description) updateFields.description = description;
    if (headId) updateFields.head = headId;
    if (isActive !== undefined) updateFields.isActive = isActive;
    
    // Update department
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    res.json(department);
  } catch (error) {
    console.error('Update department error:', error.message);
    res.status(500).json({ message: 'Server error updating department' });
  }
});

export default router;