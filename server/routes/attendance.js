import express from 'express';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import { auth, adminAuth } from '../middleware/auth.js';
import imagekit from '../utils/imagekit.js';
import { Parser } from 'json2csv';

const router = express.Router();

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
    
    await attendance.remove();
    
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Delete attendance error:', error.message);
    res.status(500).json({ message: 'Server error deleting attendance' });
  }
});

export default router;