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
    confidence: Number,
    verified: {
      type: Boolean,
      default: false
    }
  },
  checkOut: {
    time: Date,
    imageUrl: String,
    confidence: Number,
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
  location: {
    type: {
      lat: Number,
      lng: Number
    }
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