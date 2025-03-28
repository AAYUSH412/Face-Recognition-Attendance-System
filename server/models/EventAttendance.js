import mongoose from 'mongoose';

const EventAttendanceSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  checkedInAt: {
    type: Date,
    default: Date.now
  },
  checkedInBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verified: {
    type: Boolean,
    default: false
  },
  notes: String
}, { timestamps: true });

// Compound index to ensure a user can only have one attendance record per event
EventAttendanceSchema.index({ event: 1, user: 1 }, { unique: true });

export default mongoose.model('EventAttendance', EventAttendanceSchema);