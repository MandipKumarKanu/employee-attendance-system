const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { DEFAULT_LEAVE_BALANCES } = require('../config/constants');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'employee'],
      default: 'employee',
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    employeeId: {
      type: String,
      unique: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    leaveBalances: {
      casual: { type: Number, default: DEFAULT_LEAVE_BALANCES.casual },
      sick: { type: Number, default: DEFAULT_LEAVE_BALANCES.sick },
      earned: { type: Number, default: DEFAULT_LEAVE_BALANCES.earned },
      unpaid: { type: Number, default: DEFAULT_LEAVE_BALANCES.unpaid },
    },
    officeLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
      radiusMeters: { type: Number, default: 200 },
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.index({ department: 1 });
userSchema.index({ role: 1 });

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.pre('save', async function () {
  if (this.employeeId) return;
  const count = await this.constructor.countDocuments();
  this.employeeId = `EMP-${String(count + 1).padStart(4, '0')}`;
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
