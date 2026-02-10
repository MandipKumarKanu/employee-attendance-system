const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Department code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 300,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    officeLocation: {
      address: { type: String },
      latitude: { type: Number },
      longitude: { type: Number },
      radiusMeters: { type: Number, default: 200 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

departmentSchema.virtual('employees', {
  ref: 'User',
  localField: '_id',
  foreignField: 'department',
  count: true,
});

module.exports = mongoose.model('Department', departmentSchema);
