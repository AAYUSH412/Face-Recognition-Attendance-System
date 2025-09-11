import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkIn: {
    time: Date,
    imageUrl: String,
    qrCode: String, // Store QR code data for QR-based attendance
    confidence: Number,
    method: {
      type: String,
      enum: ['face_recognition', 'manual', 'qr_code'],
      default: 'face_recognition'
    },
    location: String,
    verified: {
      type: Boolean,
      default: false
    }
  },
  checkOut: {
    time: Date,
    imageUrl: String,
    qrCode: String, // Store QR code data for QR-based attendance
    confidence: Number,
    method: {
      type: String,
      enum: ['face_recognition', 'manual', 'qr_code'],
      default: 'face_recognition'
    },
    location: String,
    verified: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half-day', 'early-checkout', 'late-early-checkout'],
    default: 'present'
  },
  method: {
    type: String,
    enum: ['face_recognition', 'manual', 'qr_code'],
    default: 'face_recognition'
  },
  location: String,
  hoursWorked: {
    type: Number,
    default: 0
  },
  notes: String,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  earlyCheckout: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model('Attendance', AttendanceSchema);