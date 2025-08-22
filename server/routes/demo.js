import express from 'express';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Event from '../models/Event.js';
import bcryptjs from 'bcryptjs';

const router = express.Router();

// @route   POST api/demo/setup
// @desc    Setup demo data
// @access  Public (for demo purposes)
router.post('/setup', async (req, res) => {
  try {
    // Check if demo data already exists
    const existingAdmin = await User.findOne({ email: 'demo.admin@college.edu' });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Demo data already exists' });
    }

    // Create or find departments
    let departments = [];
    const departmentData = [
      {
        name: 'Computer Science',
        description: 'Computer Science and Engineering Department'
      },
      {
        name: 'Information Technology',
        description: 'Information Technology Department'
      },
      {
        name: 'Electronics',
        description: 'Electronics and Communication Engineering'
      }
    ];

    for (const deptData of departmentData) {
      let dept = await Department.findOne({ name: deptData.name });
      if (!dept) {
        dept = new Department(deptData);
        await dept.save();
      }
      departments.push(dept);
    }

    // Create demo admin user
    const hashedPassword = await bcryptjs.hash('demo123', 12);
    const admin = new User({
      name: 'Demo Administrator',
      email: 'demo.admin@college.edu',
      password: hashedPassword,
      role: 'admin',
      registrationId: 'ADMIN001',
      department: departments[0]._id,
      isActive: true
    });
    await admin.save();

    // Create demo faculty user
    const faculty = new User({
      name: 'Dr. John Smith',
      email: 'john.smith@college.edu',
      password: hashedPassword,
      role: 'faculty',
      registrationId: 'FAC001',
      department: departments[0]._id,
      isActive: true
    });
    await faculty.save();

    // Create demo student users
    const studentData = [
      {
        name: 'Alice Johnson',
        email: 'alice.johnson@student.college.edu',
        password: hashedPassword,
        role: 'student',
        registrationId: 'STU001',
        department: departments[0]._id,
        isActive: true
      },
      {
        name: 'Bob Wilson',
        email: 'bob.wilson@student.college.edu',
        password: hashedPassword,
        role: 'student',
        registrationId: 'STU002',
        department: departments[1]._id,
        isActive: true
      },
      {
        name: 'Carol Davis',
        email: 'carol.davis@student.college.edu',
        password: hashedPassword,
        role: 'student',
        registrationId: 'STU003',
        department: departments[0]._id,
        isActive: true
      }
    ];

    const students = [];
    for (const studentInfo of studentData) {
      const student = new User(studentInfo);
      await student.save();
      students.push(student);
    }

    // Create demo events
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(17, 0, 0, 0);
    
    const nextWeekEnd = new Date(nextWeek);
    nextWeekEnd.setHours(16, 0, 0, 0);

    const events = [
      {
        name: 'Orientation Program',
        description: 'Welcome orientation for new students',
        startDate: tomorrow,
        endDate: tomorrowEnd,
        location: 'Main Auditorium',
        organizer: admin._id,
        department: departments[0]._id,
        attendeeType: 'all',
        isActive: true
      },
      {
        name: 'Technical Workshop',
        description: 'Hands-on workshop on latest technologies',
        startDate: nextWeek,
        endDate: nextWeekEnd,
        location: 'Computer Lab',
        organizer: faculty._id,
        department: departments[0]._id,
        attendeeType: 'department',
        eligibleDepartments: [departments[0]._id],
        isActive: true
      }
    ];

    for (const eventData of events) {
      const event = new Event(eventData);
      await event.save();
    }

    res.status(201).json({
      message: 'Demo data created successfully',
      credentials: {
        admin: {
          email: 'demo.admin@college.edu',
          password: 'demo123'
        },
        faculty: {
          email: 'john.smith@college.edu',
          password: 'demo123'
        },
        students: [
          { email: 'alice.johnson@student.college.edu', password: 'demo123' },
          { email: 'bob.wilson@student.college.edu', password: 'demo123' },
          { email: 'carol.davis@student.college.edu', password: 'demo123' }
        ]
      }
    });

  } catch (error) {
    console.error('Error setting up demo data:', error);
    res.status(500).json({ 
      message: 'Failed to setup demo data',
      error: error.message 
    });
  }
});

// @route   DELETE api/demo/cleanup
// @desc    Clean up demo data
// @access  Public (for demo purposes)
router.delete('/cleanup', async (req, res) => {
  try {
    // Delete demo users
    await User.deleteMany({ 
      email: { 
        $in: [
          'demo.admin@college.edu',
          'john.smith@college.edu',
          'alice.johnson@student.college.edu',
          'bob.wilson@student.college.edu',
          'carol.davis@student.college.edu'
        ]
      }
    });

    // Delete demo events
    await Event.deleteMany({
      name: { $in: ['Orientation Program', 'Technical Workshop'] }
    });

    // Optionally delete demo departments (commented out to prevent issues with existing data)
    // await Department.deleteMany({ 
    //   name: { $in: ['Computer Science', 'Information Technology', 'Electronics'] }
    // });

    res.json({ message: 'Demo data cleaned up successfully' });

  } catch (error) {
    console.error('Error cleaning up demo data:', error);
    res.status(500).json({ 
      message: 'Failed to cleanup demo data',
      error: error.message 
    });
  }
});

export default router;
