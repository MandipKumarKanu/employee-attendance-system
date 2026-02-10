const mongoose = require('mongoose');
const { WORK_CONFIG } = require('../config/constants');

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    checkIn: {
      time: { type: Date },
      method: {
        type: String,
        enum: ['manual', 'qr', 'gps'],
      },
      location: {
        latitude: { type: Number },
        longitude: { type: Number },
      },
      withinGeofence: { type: Boolean },
      ipAddress: { type: String },
    },
    checkOut: {
      time: { type: Date },
      method: {
        type: String,
        enum: ['manual', 'qr', 'gps'],
      },
      location: {
        latitude: { type: Number },
        longitude: { type: Number },
      },
      withinGeofence: { type: Boolean },
    },
    totalHours: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'half-day', 'on-leave', 'holiday', 'weekend'],
      default: 'present',
    },
    overtimeHours: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    isReviewed: {
      type: Boolean,
      default: false,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ user: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ status: 1 });

attendanceSchema.pre('save', function () {
  if (this.checkIn?.time && this.checkOut?.time) {
    const diffMs = this.checkOut.time - this.checkIn.time;
    this.totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;

    if (this.totalHours > WORK_CONFIG.standardHours) {
      this.overtimeHours = Math.round((this.totalHours - WORK_CONFIG.standardHours) * 100) / 100;
    }

    if (this.totalHours < WORK_CONFIG.halfDayThreshold) {
      this.status = 'half-day';
    }
  }
});

attendanceSchema.pre('save', function () {
  if (this.checkIn?.time && this.status !== 'on-leave' && this.status !== 'half-day') {
    const checkInTime = new Date(this.checkIn.time);
    const checkInHour = checkInTime.getHours();
    const checkInMinute = checkInTime.getMinutes();

    const lateHour = WORK_CONFIG.startHour;
    const lateMinute = WORK_CONFIG.startMinute + WORK_CONFIG.lateThresholdMinute;

    if (checkInHour > lateHour || (checkInHour === lateHour && checkInMinute > lateMinute)) {
      this.status = 'late';
    } else {
      this.status = 'present';
    }
  }
});

module.exports = mongoose.model('Attendance', attendanceSchema);
