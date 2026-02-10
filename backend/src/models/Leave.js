const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    leaveType: {
      type: String,
      enum: ['casual', 'sick', 'earned', 'unpaid'],
      required: [true, 'Leave type is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    totalDays: {
      type: Number,
      required: true,
    },
    isHalfDay: {
      type: Boolean,
      default: false,
    },
    halfDayPeriod: {
      type: String,
      enum: ['morning', 'afternoon'],
      default: null,
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      maxlength: 500,
    },
    attachment: {
      type: String,
    },
  },
  { timestamps: true }
);

leaveSchema.index({ user: 1, status: 1 });
leaveSchema.index({ startDate: 1, endDate: 1 });
leaveSchema.index({ status: 1 });

leaveSchema.pre('validate', function () {
  if (this.isHalfDay) {
    this.totalDays = 0.5;
  } else if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    this.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
});

module.exports = mongoose.model('Leave', leaveSchema);
