import express from 'express';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import { auth, adminAuth } from '../middleware/auth.js';
import imagekit from '../utils/imagekit.js';
import { Parser } from 'json2csv';

const router = express.Router();

// @route   POST api/attendance/mark-manual
// @desc    Mark attendance manually (demo mode)
// @access  Private
router.post('/mark-manual', auth, async (req, res) => {
  try {
    const { type, location, timestamp } = req.body;
    
    // Check attendance type (check-in or check-out)
    const isCheckIn = type === 'check-in';
    
    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find if the user already has an attendance record for today
    let attendance = await Attendance.findOne({
      user: req.user.id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    // If checking in and no attendance record exists, create new one
    if (isCheckIn) {
      if (attendance && attendance.checkIn.time) {
        return res.status(400).json({ 
          message: 'Already checked in today',
          attendance 
        });
      }
      
      if (!attendance) {
        // Get check-in cutoff time from settings (default: 9:00 AM)
        const currentTime = new Date();
        const cutoffTime = new Date(today);
        cutoffTime.setHours(9, 0, 0, 0); // 9:00 AM cutoff
        
        const status = currentTime > cutoffTime ? 'late' : 'present';
        
        attendance = new Attendance({
          user: req.user.id,
          date: today,
          status: status,
          checkIn: {
            time: currentTime,
            method: 'manual',
            confidence: 100, // Manual is 100% confident
            location: location || 'Manual Entry'
          },
          method: 'manual'
        });
      } else {
        attendance.checkIn = {
          time: new Date(),
          method: 'manual',
          confidence: 100,
          location: location || 'Manual Entry'
        };
        
        // Update status based on check-in time
        const cutoffTime = new Date(today);
        cutoffTime.setHours(9, 0, 0, 0);
        attendance.status = new Date() > cutoffTime ? 'late' : 'present';
      }
    } 
    // If checking out, update the existing record
    else {
      if (!attendance || !attendance.checkIn.time) {
        return res.status(400).json({ 
          message: 'Must check in before checking out' 
        });
      }
      
      if (attendance.checkOut.time) {
        return res.status(400).json({ 
          message: 'Already checked out today',
          attendance 
        });
      }
      
      attendance.checkOut = {
        time: new Date(),
        method: 'manual',
        confidence: 100,
        location: location || 'Manual Entry'
      };
      
      // Calculate hours worked
      const checkInTime = new Date(attendance.checkIn.time);
      const checkOutTime = new Date(attendance.checkOut.time);
      const hoursWorked = (checkOutTime - checkInTime) / (1000 * 60 * 60);
      attendance.hoursWorked = Math.round(hoursWorked * 100) / 100;
    }
    
    await attendance.save();
    
    // Populate user data for response
    await attendance.populate('user', 'name email studentId employeeId');
    
    res.json({
      success: true,
      message: `${isCheckIn ? 'Check-in' : 'Check-out'} successful`,
      attendance,
      checkInTime: attendance.checkIn.time,
      checkOutTime: attendance.checkOut ? attendance.checkOut.time : null,
      status: attendance.status,
      hoursWorked: attendance.hoursWorked || 0
    });
    
  } catch (error) {
    console.error('Error marking manual attendance:', error);
    res.status(500).json({ 
      message: 'Failed to mark attendance',
      error: error.message 
    });
  }
});

// @route   GET api/attendance/today
// @desc    Get today's attendance record
// @access  Private
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const attendance = await Attendance.findOne({
      user: req.user.id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }).populate('user', 'name email studentId employeeId');
    
    if (!attendance) {
      return res.status(404).json({ message: 'No attendance record found for today' });
    }
    
    res.json({
      ...attendance.toObject(),
      checkInTime: attendance.checkIn.time,
      checkOutTime: attendance.checkOut ? attendance.checkOut.time : null,
    });
    
  } catch (error) {
    console.error('Error fetching today attendance:', error);
    res.status(500).json({ 
      message: 'Failed to fetch attendance',
      error: error.message 
    });
  }
});

// @route   POST api/attendance/mark
// @desc    Mark attendance with face recognition
// @access  Private
router.post('/mark', auth, async (req, res) => {
  try {
    const { base64Image, confidence, location, type } = req.body;
    
    // Check attendance type (check-in or check-out)
    const isCheckIn = type === 'check-in';
    
    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find if the user already has an attendance record for today
    let attendance = await Attendance.findOne({
      user: req.user.id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    // Upload attendance image to ImageKit
    let imageUrl = '';
    if (base64Image) {
      const uploadResponse = await imagekit.upload({
        file: base64Image,
        fileName: `attendance_${isCheckIn ? 'in' : 'out'}_${req.user.id}_${Date.now()}.jpg`,
        folder: '/attendance/'
      });
      imageUrl = uploadResponse.url;
    }
    
    // If checking in and no attendance record exists, create new one
    if (isCheckIn) {
      
      if (!attendance) {
        // Get check-in cutoff time from settings (default: 9:00 AM)
        const currentTime = new Date();
        const user = await User.findById(req.user.id).populate('department');
        
        // Set standard work hours (9 AM to 5 PM)
        const startHour = user.department?.settings?.startHour || 9;
        const startMinute = user.department?.settings?.startMinute || 0;
        
        const lateCutoff = new Date(today);
        lateCutoff.setHours(startHour, startMinute, 0, 0);
        
        // Set status based on check-in time
        const status = currentTime > lateCutoff ? 'late' : 'present';

        attendance = new Attendance({
          user: req.user.id,
          date: today,
          checkIn: {
            time: new Date(),
            imageUrl,
            confidence: confidence || 0,
            verified: confidence >= 0.8 // Auto-verify if confidence is high
          },
          status,
          location: location || null
        });
      } else {
        attendance.checkIn = {
          time: new Date(),
          imageUrl,
          confidence: confidence || 0,
          verified: confidence >= 0.8
        };
        
        if (location) {
          attendance.location = location;
        }
      }
    } 
    // If checking out, update the existing record
    else {
      if (!attendance || !attendance.checkIn.time) {
        return res.status(400).json({ 
          message: 'Must check in before checking out' 
        });
      }
      
      if (attendance.checkOut.time) {
        return res.status(400).json({ 
          message: 'Already checked out today',
          attendance 
        });
      }
      
      // Check for early checkout
      const currentTime = new Date();
      const user = await User.findById(req.user.id).populate('department');
      
      // Set standard work end time (5 PM)
      const endHour = user.department?.settings?.endHour || 17; // 5 PM in 24-hour format
      const endMinute = user.department?.settings?.endMinute || 0;
      
      const endTimeCutoff = new Date(today);
      endTimeCutoff.setHours(endHour, endMinute, 0, 0);
      
      // Update checkout info
      attendance.checkOut = {
        time: new Date(),
        imageUrl,
        confidence: confidence || 0,
        verified: confidence >= 0.8
      };
      
      // Set early-checkout status if applicable
      if (currentTime < endTimeCutoff) {
        attendance.earlyCheckout = true;
        // Optionally update the status if you want to track early checkouts in status
        // attendance.status = attendance.status === 'late' ? 'late-early-checkout' : 'early-checkout';
      }
      
      if (location) {
        attendance.location = location;
      }
      
      // Calculate hours worked
      if (attendance.checkIn.time) {
        const checkInTime = new Date(attendance.checkIn.time);
        const checkOutTime = new Date();
        const hoursWorked = (checkOutTime - checkInTime) / (1000 * 60 * 60);
        attendance.hoursWorked = parseFloat(hoursWorked.toFixed(2));
      }
    }
    
    await attendance.save();
    
    res.json({
      success: true,
      message: `${isCheckIn ? 'Check-in' : 'Check-out'} recorded successfully`,
      attendance
    });
  } catch (error) {
    console.error('Mark attendance error:', error.message);
    res.status(500).json({ message: 'Server error marking attendance' });
  }
});

// @route   GET api/attendance/me
// @desc    Get current user's attendance
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const { startDate, endDate, limit, page } = req.query;
    
    let dateFilter = { user: req.user.id };
    
    if (startDate && endDate) {
      dateFilter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Pagination
    const pageSize = parseInt(limit) || 20;
    const currentPage = parseInt(page) || 1;
    const skip = (currentPage - 1) * pageSize;
    
    const totalRecords = await Attendance.countDocuments(dateFilter);
    const totalPages = Math.ceil(totalRecords / pageSize);
    
    const attendance = await Attendance.find(dateFilter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(pageSize);
    
    res.json({
      records: attendance,
      pagination: {
        total: totalRecords,
        pages: totalPages,
        page: currentPage,
        pageSize
      }
    });
  } catch (error) {
    console.error('Get attendance error:', error.message);
    res.status(500).json({ message: 'Server error fetching attendance' });
  }
});

// @route   POST api/attendance/admin/create
// @desc    Create attendance record manually (admin only)
// @access  Private/Admin
router.post('/admin/create', adminAuth, async (req, res) => {
  try {
    const { userId, date, status, checkInTime, checkOutTime, notes } = req.body;
    
    if (!userId || !date || !status) {
      return res.status(400).json({ 
        message: 'User ID, date, and status are required' 
      });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Parse the date to start of day
    const recordDate = new Date(date);
    recordDate.setHours(0, 0, 0, 0);
    
    // Check if attendance record already exists for this date
    const existingRecord = await Attendance.findOne({
      user: userId,
      date: {
        $gte: recordDate,
        $lt: new Date(recordDate.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    if (existingRecord) {
      return res.status(400).json({ 
        message: 'Attendance record already exists for this date' 
      });
    }
    
    // Create attendance object
    const attendanceData = {
      user: userId,
      date: recordDate,
      status: status,
      method: 'manual',
      notes: notes || '',
      verifiedBy: req.user.id
    };
    
    // Add check-in data if provided
    if (checkInTime) {
      const checkInDateTime = new Date(recordDate);
      const [hours, minutes] = checkInTime.split(':');
      checkInDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      attendanceData.checkIn = {
        time: checkInDateTime,
        method: 'manual',
        confidence: 100,
        verified: true,
        location: 'Admin Entry'
      };
    }
    
    // Add check-out data if provided
    if (checkOutTime) {
      const checkOutDateTime = new Date(recordDate);
      const [hours, minutes] = checkOutTime.split(':');
      checkOutDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      attendanceData.checkOut = {
        time: checkOutDateTime,
        method: 'manual',
        confidence: 100,
        verified: true,
        location: 'Admin Entry'
      };
      
      // Calculate hours worked if both times are provided
      if (checkInTime) {
        const hoursWorked = (checkOutDateTime - attendanceData.checkIn.time) / (1000 * 60 * 60);
        attendanceData.hoursWorked = parseFloat(hoursWorked.toFixed(2));
      }
    }
    
    const attendance = new Attendance(attendanceData);
    await attendance.save();
    
    // Populate user data for response
    await attendance.populate('user', 'name email registrationId');
    
    res.status(201).json({
      message: 'Attendance record created successfully',
      attendance
    });
    
  } catch (error) {
    console.error('Error creating manual attendance record:', error);
    res.status(500).json({ 
      message: 'Failed to create attendance record',
      error: error.message 
    });
  }
});

// @route   GET api/attendance/admin/stats
// @desc    Get attendance statistics for admin dashboard
// @access  Private/Admin
router.get('/admin/stats', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate, departmentId } = req.query;
    
    let filter = {};
    
    // Date filter
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Department filter
    if (departmentId) {
      const usersInDepartment = await User.find({ department: departmentId }).select('_id');
      const userIds = usersInDepartment.map(user => user._id);
      filter.user = { $in: userIds };
    }
    
    const allAttendance = await Attendance.find(filter);
    
    // Calculate statistics
    const totalRecords = allAttendance.length;
    const presentCount = allAttendance.filter(a => a.status === 'present').length;
    const lateCount = allAttendance.filter(a => a.status === 'late').length;
    const absentCount = allAttendance.filter(a => a.status === 'absent').length;
    const halfDayCount = allAttendance.filter(a => a.status === 'half-day').length;
    
    // Calculate pending verification count
    const pendingVerificationCount = allAttendance.filter(a => 
      (!a.checkIn?.verified && a.checkIn?.time) ||
      (!a.checkOut?.verified && a.checkOut?.time)
    ).length;
    
    // Calculate average hours worked
    const recordsWithHours = allAttendance.filter(a => a.hoursWorked);
    const totalHours = recordsWithHours.reduce((sum, record) => sum + (record.hoursWorked || 0), 0);
    const averageHours = recordsWithHours.length ? (totalHours / recordsWithHours.length).toFixed(2) : 0;
    
    // Get unique users count
    const uniqueUsers = new Set(allAttendance.map(a => a.user.toString())).size;
    
    res.json({
      total: totalRecords,
      present: presentCount,
      late: lateCount,
      absent: absentCount,
      halfDay: halfDayCount,
      pendingVerification: pendingVerificationCount,
      presentPercentage: totalRecords ? ((presentCount / totalRecords) * 100).toFixed(2) : 0,
      latePercentage: totalRecords ? ((lateCount / totalRecords) * 100).toFixed(2) : 0,
      absentPercentage: totalRecords ? ((absentCount / totalRecords) * 100).toFixed(2) : 0,
      averageHoursWorked: averageHours,
      activeUsers: uniqueUsers
    });
  } catch (error) {
    console.error('Get admin attendance stats error:', error.message);
    res.status(500).json({ message: 'Server error fetching admin attendance statistics' });
  }
});

// @route   GET api/attendance/stats
// @desc    Get attendance statistics for the current user
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = { user: req.user.id };
    
    if (startDate && endDate) {
      dateFilter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const allAttendance = await Attendance.find(dateFilter);
    
    // Calculate statistics
    const totalRecords = allAttendance.length;
    const presentCount = allAttendance.filter(a => a.status === 'present').length;
    const lateCount = allAttendance.filter(a => a.status === 'late').length;
    const absentCount = allAttendance.filter(a => a.status === 'absent').length;
    const halfDayCount = allAttendance.filter(a => a.status === 'half-day').length;
    
    // Calculate average hours worked
    const recordsWithHours = allAttendance.filter(a => a.hoursWorked);
    const totalHours = recordsWithHours.reduce((sum, record) => sum + (record.hoursWorked || 0), 0);
    const averageHours = recordsWithHours.length ? (totalHours / recordsWithHours.length).toFixed(2) : 0;
    
    // Calculate streak (consecutive days with attendance)
    let currentStreak = 0;
    if (allAttendance.length > 0) {
      // Sort by date in ascending order
      const sortedAttendance = [...allAttendance].sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Find consecutive days
      let streak = 1;
      for (let i = 1; i < sortedAttendance.length; i++) {
        const prevDate = new Date(sortedAttendance[i-1].date);
        const currDate = new Date(sortedAttendance[i].date);
        
        // Check if dates are consecutive
        const diffTime = Math.abs(currDate - prevDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          streak++;
        } else {
          streak = 1; // Reset streak if days are not consecutive
        }
      }
      currentStreak = streak;
    }
    
    res.json({
      totalDays: totalRecords,
      present: presentCount,
      late: lateCount,
      absent: absentCount,
      halfDay: halfDayCount,
      presentPercentage: totalRecords ? ((presentCount / totalRecords) * 100).toFixed(2) : 0,
      latePercentage: totalRecords ? ((lateCount / totalRecords) * 100).toFixed(2) : 0,
      absentPercentage: totalRecords ? ((absentCount / totalRecords) * 100).toFixed(2) : 0,
      averageHoursWorked: averageHours,
      currentStreak
    });
  } catch (error) {
    console.error('Get attendance stats error:', error.message);
    res.status(500).json({ message: 'Server error fetching attendance statistics' });
  }
});

// @route   GET api/attendance
// @desc    Get all attendance records (admin only)
// @access  Private/Admin
router.get('/', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate, userId, departmentId, status, verification, page, limit } = req.query;
    
    let filter = {};
    
    // Date filter
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // User filter
    if (userId) {
      filter.user = userId;
    }
    
    // Department filter
    if (departmentId) {
      const usersInDepartment = await User.find({ department: departmentId }).select('_id');
      const userIds = usersInDepartment.map(user => user._id);
      filter.user = { $in: userIds };
    }
    
    // Status filter
    if (status) {
      filter.status = status;
    }
    
    // Verification filter
    if (verification === 'verified') {
      filter.$and = [
        { $or: [{ 'checkIn.verified': true }, { 'checkIn.time': { $exists: false } }] },
        { $or: [{ 'checkOut.verified': true }, { 'checkOut.time': { $exists: false } }] }
      ];
    } else if (verification === 'unverified') {
      filter.$or = [
        { 'checkIn.verified': false, 'checkIn.time': { $exists: true } },
        { 'checkOut.verified': false, 'checkOut.time': { $exists: true } }
      ];
    }
    
    // Pagination
    const pageSize = parseInt(limit) || 20;
    const currentPage = parseInt(page) || 1;
    const skip = (currentPage - 1) * pageSize;
    
    const totalRecords = await Attendance.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / pageSize);
    
    const attendance = await Attendance.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(pageSize)
      .populate({
        path: 'user',
        select: 'name email role registrationId',
        populate: { path: 'department', select: 'name code' }
      })
      .populate({
        path: 'verifiedBy',
        select: 'name email'
      });
    
    res.json({
      records: attendance,
      pagination: {
        total: totalRecords,
        pages: totalPages,
        page: currentPage,
        pageSize
      }
    });
  } catch (error) {
    console.error('Get all attendance error:', error.message);
    res.status(500).json({ message: 'Server error fetching all attendance' });
  }
});

// @route   PATCH api/attendance/bulk-verify
// @desc    Bulk verify attendance records (admin only)
// @access  Private/Admin
router.patch('/bulk-verify', adminAuth, async (req, res) => {
  try {
    const { recordIds, action } = req.body;
    
    if (!recordIds || !Array.isArray(recordIds) || recordIds.length === 0) {
      return res.status(400).json({ message: 'Record IDs array is required' });
    }
    
    if (!action || !action.type || (action.type !== 'checkIn' && action.type !== 'checkOut')) {
      return res.status(400).json({ message: 'Valid action type (checkIn or checkOut) is required' });
    }
    
    // Find all attendance records
    const attendanceRecords = await Attendance.find({ _id: { $in: recordIds } });
    
    if (attendanceRecords.length === 0) {
      return res.status(404).json({ message: 'No attendance records found' });
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    // Update each record
    for (const attendance of attendanceRecords) {
      try {
        // Check if the type exists on the record
        if (!attendance[action.type] || !attendance[action.type].time) {
          errorCount++;
          continue;
        }
        
        // Update verification status
        attendance[action.type].verified = true;
        attendance.verifiedBy = req.user.id;
        
        await attendance.save();
        successCount++;
      } catch (error) {
        console.error(`Error verifying attendance ${attendance._id}:`, error);
        errorCount++;
      }
    }
    
    res.json({
      message: `Bulk verification completed: ${successCount} successful, ${errorCount} failed`,
      successCount,
      errorCount
    });
  } catch (error) {
    console.error('Bulk verify attendance error:', error.message);
    res.status(500).json({ message: 'Server error during bulk verification' });
  }
});

// @route   PATCH api/attendance/:id/verify
// @desc    Verify attendance check-in or check-out (admin only)
// @access  Private/Admin
router.patch('/:id/verify', adminAuth, async (req, res) => {
  try {
    const { type } = req.body; // type can be 'checkIn' or 'checkOut'
    
    if (!type || (type !== 'checkIn' && type !== 'checkOut')) {
      return res.status(400).json({ message: 'Invalid verification type' });
    }
    
    const attendance = await Attendance.findById(req.params.id);
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    // Check if the type exists on the record
    if (!attendance[type] || !attendance[type].time) {
      return res.status(400).json({ message: `No ${type === 'checkIn' ? 'check-in' : 'check-out'} record found` });
    }
    
    // Update verification status
    attendance[type].verified = true;
    attendance.verifiedBy = req.user.id;
    
    await attendance.save();
    
    res.json({
      message: `${type === 'checkIn' ? 'Check-in' : 'Check-out'} verified successfully`,
      attendance
    });
  } catch (error) {
    console.error(`Error verifying attendance:`, error.message);
    res.status(500).json({ message: 'Server error verifying attendance' });
  }
});

// @route   PATCH api/attendance/:id/reject
// @desc    Reject attendance check-in or check-out (admin only)
// @access  Private/Admin
router.patch('/:id/reject', adminAuth, async (req, res) => {
  try {
    const { type } = req.body; // type can be 'checkIn' or 'checkOut'
    
    if (!type || (type !== 'checkIn' && type !== 'checkOut')) {
      return res.status(400).json({ message: 'Invalid rejection type' });
    }
    
    const attendance = await Attendance.findById(req.params.id);
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    // Check if the type exists on the record
    if (!attendance[type] || !attendance[type].time) {
      return res.status(400).json({ message: `No ${type === 'checkIn' ? 'check-in' : 'check-out'} record found` });
    }
    
    // If rejecting check-in on a record with check-out, clear both
    if (type === 'checkIn' && attendance.checkOut.time) {
      attendance.checkOut = {};
    }
    
    // Reset the specified field
    attendance[type] = {};
    attendance.verifiedBy = req.user.id;
    
    // If check-in was rejected and this is the only record for the day, set status to absent
    if (type === 'checkIn' && !attendance.checkOut.time) {
      attendance.status = 'absent';
    }
    
    await attendance.save();
    
    res.json({
      message: `${type === 'checkIn' ? 'Check-in' : 'Check-out'} rejected successfully`,
      attendance
    });
  } catch (error) {
    console.error(`Error rejecting attendance:`, error.message);
    res.status(500).json({ message: 'Server error rejecting attendance' });
  }
});

// @route   PUT api/attendance/:id
// @desc    Update attendance record (admin only)
// @access  Private/Admin
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { status, notes, checkInVerified, checkOutVerified, checkInTime, checkOutTime } = req.body;
    
    const attendance = await Attendance.findById(req.params.id);
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    // Update verification status
    if (checkInVerified !== undefined && attendance.checkIn) {
      attendance.checkIn.verified = checkInVerified;
    }
    
    if (checkOutVerified !== undefined && attendance.checkOut) {
      attendance.checkOut.verified = checkOutVerified;
    }
    
    // Update check-in/out times
    if (checkInTime && attendance.checkIn) {
      attendance.checkIn.time = new Date(checkInTime);
    }
    
    if (checkOutTime && attendance.checkOut) {
      attendance.checkOut.time = new Date(checkOutTime);
    }
    
    // Calculate hours worked if both check-in and check-out are available
    if (attendance.checkIn?.time && attendance.checkOut?.time) {
      const checkInTime = new Date(attendance.checkIn.time);
      const checkOutTime = new Date(attendance.checkOut.time);
      const hoursWorked = (checkOutTime - checkInTime) / (1000 * 60 * 60);
      attendance.hoursWorked = parseFloat(hoursWorked.toFixed(2));
    }
    
    // Update other fields
    if (status) attendance.status = status;
    if (notes) attendance.notes = notes;
    
    attendance.verifiedBy = req.user.id;
    
    await attendance.save();
    
    res.json({
      message: 'Attendance record updated',
      attendance
    });
  } catch (error) {
    console.error('Update attendance error:', error.message);
    res.status(500).json({ message: 'Server error updating attendance' });
  }
});

// @route   GET api/attendance/export
// @desc    Export attendance records as CSV (admin only)
// @access  Private/Admin
router.get('/export', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate, userId, departmentId } = req.query;
    
    let filter = {};
    
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (userId) {
      filter.user = userId;
    }
    
    if (departmentId) {
      const usersInDepartment = await User.find({ department: departmentId }).select('_id');
      const userIds = usersInDepartment.map(user => user._id);
      filter.user = { $in: userIds };
    }
    
    const attendance = await Attendance.find(filter)
      .sort({ date: -1 })
      .populate('user', 'name email role registrationId');
    
    // Format data for CSV
    const records = attendance.map(record => {
      return {
        Date: new Date(record.date).toLocaleDateString(),
        Name: record.user?.name || 'Unknown',
        Email: record.user?.email || 'Unknown',
        Role: record.user?.role || 'Unknown',
        RegistrationId: record.user?.registrationId || 'N/A',
        Status: record.status || 'Unknown',
        CheckInTime: record.checkIn?.time ? new Date(record.checkIn.time).toLocaleTimeString() : 'N/A',
        CheckInVerified: record.checkIn?.verified ? 'Yes' : 'No',
        CheckOutTime: record.checkOut?.time ? new Date(record.checkOut.time).toLocaleTimeString() : 'N/A',
        CheckOutVerified: record.checkOut?.verified ? 'Yes' : 'No',
        HoursWorked: record.hoursWorked || 'N/A',
        Notes: record.notes || ''
      };
    });
    
    // Generate CSV
    const fields = [
      'Date', 'Name', 'Email', 'Role', 'RegistrationId', 'Status', 
      'CheckInTime', 'CheckInVerified', 'CheckOutTime', 'CheckOutVerified',
      'HoursWorked', 'Notes'
    ];
    
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(records);
    
    // Set headers for file download
    res.setHeader('Content-Disposition', 'attachment; filename=attendance.csv');
    res.setHeader('Content-Type', 'text/csv');
    
    res.send(csv);
  } catch (error) {
    console.error('Export attendance error:', error.message);
    res.status(500).json({ message: 'Server error exporting attendance' });
  }
});

// @route   DELETE api/attendance/:id
// @desc    Delete an attendance record (admin only)
// @access  Private/Admin
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    // Store attendance info for response before deletion
    const deletedAttendanceInfo = {
      id: attendance._id,
      userId: attendance.user,
      date: attendance.date,
      status: attendance.status
    };
    
    // Delete the attendance record using findByIdAndDelete
    await Attendance.findByIdAndDelete(req.params.id);
    
    res.json({ 
      message: 'Attendance record deleted successfully',
      deletedRecord: deletedAttendanceInfo
    });
  } catch (error) {
    console.error('Delete attendance error:', error.message);
    if (error.kind === 'ObjectId' || error.name === 'CastError') {
      return res.status(404).json({ message: 'Attendance record not found - Invalid ID' });
    }
    res.status(500).json({ message: 'Server error deleting attendance' });
  }
});

export default router;