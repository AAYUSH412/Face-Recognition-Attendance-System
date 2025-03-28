import express from 'express';
import Event from '../models/Event.js';
import EventAttendance from '../models/EventAttendance.js';
import User from '../models/User.js';
import { auth, adminAuth } from '../middleware/auth.js';
import { generateQRCode, validateQRCode } from '../utils/qrCodeHelper.js';

const router = express.Router();

// @route   GET api/events
// @desc    Get all events
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { upcoming, past, today, department } = req.query;
    let query = {};
    
    // Filter for upcoming events
    if (upcoming === 'true') {
      query.startDate = { $gt: new Date() };
    }
    
    // Filter for past events
    if (past === 'true') {
      query.endDate = { $lt: new Date() };
    }
    
    // Filter for today's events
    if (today === 'true') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      query.startDate = { $lte: endOfDay };
      query.endDate = { $gte: startOfDay };
    }
    
    // Filter by department
    if (department) {
      query.$or = [
        { department: department },
        { eligibleDepartments: department },
        { attendeeType: 'all' }
      ];
    }
    
    // For non-admin users, only show events they are eligible for
    if (req.user.role !== 'admin') {
      query.$or = [
        { attendeeType: 'all' },
        { eligibleDepartments: req.user.department },
        { eligibleUsers: req.user._id },
        { organizer: req.user._id }
      ];
    }
    
    const events = await Event.find(query)
      .populate('department', 'name')
      .populate('organizer', 'name email')
      .sort({ startDate: 1 });
    
    res.json(events);
  } catch (error) {
    console.error('Get events error:', error.message);
    res.status(500).json({ message: 'Server error fetching events' });
  }
});

// @route   POST api/events
// @desc    Create a new event
// @access  Private (Admin and Faculty only)
router.post('/', auth, async (req, res) => {
  try {
    // Only admin and faculty can create events
    if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Not authorized to create events' });
    }
    
    const {
      name,
      description,
      startDate,
      endDate,
      location,
      department,
      attendeeType,
      eligibleDepartments,
      eligibleUsers
    } = req.body;
    
    // Validate dates
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: 'Start date must be before end date' });
    }
    
    // Create event
    const event = new Event({
      name,
      description,
      startDate,
      endDate,
      location,
      department,
      organizer: req.user.id,
      attendeeType,
      eligibleDepartments: attendeeType === 'department' ? eligibleDepartments : [],
      eligibleUsers: attendeeType === 'specific' ? eligibleUsers : []
    });
    
    // Generate QR code data
    const qrCodeData = await generateQRCode(event._id);
    event.qrCodeData = {
      value: qrCodeData,
      expiresAt: new Date(endDate),
      isActive: true
    };
    
    await event.save();
    
    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error.message);
    res.status(500).json({ message: 'Server error creating event' });
  }
});

// @route   GET api/events/:id
// @desc    Get event by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('department', 'name')
      .populate('organizer', 'name email')
      .populate('eligibleDepartments', 'name')
      .populate('eligibleUsers', 'name email');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is eligible to view this event
    const isAdmin = req.user.role === 'admin';
    const isFaculty = req.user.role === 'faculty';
    const isOrganizer = event.organizer._id.toString() === req.user.id;
    
    if (!isAdmin && !isFaculty && !isOrganizer) {
      const isEligible = 
        event.attendeeType === 'all' || 
        (event.attendeeType === 'department' && 
          event.eligibleDepartments.some(dept => dept._id.toString() === req.user.department?.toString())) ||
        (event.attendeeType === 'specific' && 
          event.eligibleUsers.some(user => user._id.toString() === req.user.id));
      
      if (!isEligible) {
        return res.status(403).json({ message: 'Not authorized to view this event' });
      }
    }
    
    // For security, only send QR code to organizer or admin
    if (!isAdmin && !isOrganizer) {
      // Remove QR code data
      event.qrCodeData = undefined;
    }
    
    res.json(event);
  } catch (error) {
    console.error('Get event error:', error.message);
    res.status(500).json({ message: 'Server error fetching event' });
  }
});

// @route   PUT api/events/:id
// @desc    Update event
// @access  Private (Admin or Event organizer only)
router.put('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check authorization - only admin or event organizer can update
    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }
    
    const {
      name,
      description,
      startDate,
      endDate,
      location,
      department,
      attendeeType,
      eligibleDepartments,
      eligibleUsers,
      isActive
    } = req.body;
    
    // Validate dates if provided
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: 'Start date must be before end date' });
    }
    
    // Update fields
    if (name) event.name = name;
    if (description !== undefined) event.description = description;
    if (startDate) event.startDate = startDate;
    if (endDate) event.endDate = endDate;
    if (location !== undefined) event.location = location;
    if (department) event.department = department;
    if (attendeeType) {
      event.attendeeType = attendeeType;
      
      // Update eligible lists based on type
      if (attendeeType === 'department' && eligibleDepartments) {
        event.eligibleDepartments = eligibleDepartments;
        event.eligibleUsers = [];
      } else if (attendeeType === 'specific' && eligibleUsers) {
        event.eligibleUsers = eligibleUsers;
        event.eligibleDepartments = [];
      } else if (attendeeType === 'all') {
        event.eligibleDepartments = [];
        event.eligibleUsers = [];
      }
    }
    
    if (isActive !== undefined) event.isActive = isActive;
    
    await event.save();
    
    res.json(event);
  } catch (error) {
    console.error('Update event error:', error.message);
    res.status(500).json({ message: 'Server error updating event' });
  }
});

// @route   DELETE api/events/:id
// @desc    Delete event
// @access  Private (Admin or Event organizer only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check authorization - only admin or event organizer can delete
    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }
    
    // Delete event and all associated attendance records
    await EventAttendance.deleteMany({ event: req.params.id });
    await event.remove();
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error.message);
    res.status(500).json({ message: 'Server error deleting event' });
  }
});

// @route   POST api/events/:id/regenerate-qr
// @desc    Regenerate QR code for an event
// @access  Private (Admin or Event organizer only)
router.post('/:id/regenerate-qr', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check authorization - only admin or event organizer can regenerate QR code
    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to regenerate QR code for this event' });
    }
    
    // Generate new QR code data
    const qrCodeData = await generateQRCode(event._id);
    event.qrCodeData = {
      value: qrCodeData,
      expiresAt: event.endDate,
      isActive: true
    };
    
    await event.save();
    
    res.json({ 
      message: 'QR code regenerated successfully',
      qrCodeData: event.qrCodeData
    });
  } catch (error) {
    console.error('Regenerate QR code error:', error.message);
    res.status(500).json({ message: 'Server error regenerating QR code' });
  }
});

// @route   POST api/events/verify-attendance
// @desc    Verify QR code and mark attendance
// @access  Private
router.post('/verify-attendance', auth, async (req, res) => {
  try {
    const { qrCodeData } = req.body;
    
    if (!qrCodeData) {
      return res.status(400).json({ message: 'QR code data is required' });
    }
    
    // Validate QR code
    const eventId = await validateQRCode(qrCodeData);
    
    if (!eventId) {
      return res.status(400).json({ message: 'Invalid QR code' });
    }
    
    // Get event
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if QR code is active
    if (!event.qrCodeData.isActive) {
      return res.status(400).json({ message: 'QR code is no longer active' });
    }
    
    // Check if QR code is expired
    if (new Date() > new Date(event.qrCodeData.expiresAt)) {
      return res.status(400).json({ message: 'QR code has expired' });
    }
    
    // Check if event is active
    if (!event.isActive) {
      return res.status(400).json({ message: 'This event is no longer active' });
    }
    
    // Check if event has started
    if (new Date() < new Date(event.startDate)) {
      return res.status(400).json({ message: 'This event has not started yet' });
    }
    
    // Check if event has ended
    if (new Date() > new Date(event.endDate)) {
      return res.status(400).json({ message: 'This event has already ended' });
    }
    
    // Check if user is eligible to attend
    const isEligible = 
      event.attendeeType === 'all' || 
      (event.attendeeType === 'department' && 
        event.eligibleDepartments.includes(req.user.department)) ||
      (event.attendeeType === 'specific' && 
        event.eligibleUsers.includes(req.user.id));
    
    if (!isEligible) {
      return res.status(403).json({ message: 'You are not eligible to attend this event' });
    }
    
    // Check if user already attended
    const existingAttendance = await EventAttendance.findOne({
      event: eventId,
      user: req.user.id
    });
    
    if (existingAttendance) {
      return res.status(400).json({ 
        message: 'You have already checked in to this event', 
        attendance: existingAttendance 
      });
    }
    
    // Create attendance record
    const attendance = new EventAttendance({
      event: eventId,
      user: req.user.id,
      verified: true, // Auto-verify through QR code
      notes: 'Checked in via QR code'
    });
    
    await attendance.save();
    
    res.status(201).json({
      message: 'Successfully checked in to the event',
      attendance
    });
  } catch (error) {
    console.error('Verify attendance error:', error.message);
    res.status(500).json({ message: 'Server error verifying attendance' });
  }
});

// @route   GET api/events/:id/attendees
// @desc    Get all attendees for an event
// @access  Private (Admin, Faculty or Event organizer only)
router.get('/:id/attendees', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check authorization
    if (req.user.role !== 'admin' && 
        req.user.role !== 'faculty' && 
        event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view attendees' });
    }
    
    const attendees = await EventAttendance.find({ event: req.params.id })
      .populate('user', 'name email registrationId department role')
      .populate('checkedInBy', 'name email');
    
    res.json(attendees);
  } catch (error) {
    console.error('Get attendees error:', error.message);
    res.status(500).json({ message: 'Server error fetching attendees' });
  }
});

// @route   POST api/events/:id/manual-checkin
// @desc    Manually check in a user to an event
// @access  Private (Admin, Faculty or Event organizer only)
router.post('/:id/manual-checkin', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check authorization
    if (req.user.role !== 'admin' && 
        req.user.role !== 'faculty' && 
        event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to manually check in users' });
    }
    
    // Get user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user already attended
    const existingAttendance = await EventAttendance.findOne({
      event: req.params.id,
      user: userId
    });
    
    if (existingAttendance) {
      return res.status(400).json({ 
        message: 'User has already checked in to this event',
        attendance: existingAttendance 
      });
    }
    
    // Create attendance record
    const attendance = new EventAttendance({
      event: req.params.id,
      user: userId,
      checkedInBy: req.user.id,
      verified: true,
      notes: `Manually checked in by ${req.user.name}`
    });
    
    await attendance.save();
    
    res.status(201).json({
      message: 'User successfully checked in to the event',
      attendance
    });
  } catch (error) {
    console.error('Manual check-in error:', error.message);
    res.status(500).json({ message: 'Server error during manual check-in' });
  }
});

export default router;