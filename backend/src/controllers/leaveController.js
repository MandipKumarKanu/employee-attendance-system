const Leave = require('../models/Leave');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { PAGINATION } = require('../config/constants');

const applyLeave = asyncHandler(async (req, res) => {
  const { leaveType, startDate, endDate, isHalfDay } = req.body;

  // Check for overlapping approved leaves
  const overlap = await Leave.findOne({
    user: req.user._id,
    status: { $in: ['pending', 'approved'] },
    $or: [
      { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } },
    ],
  });

  if (overlap) {
    throw new ApiError(400, 'You already have a leave application overlapping these dates.');
  }

  // Check leave balance (skip for unpaid)
  if (leaveType !== 'unpaid') {
    const user = await User.findById(req.user._id);
    const balance = user.leaveBalances[leaveType];
    const daysNeeded = isHalfDay ? 0.5 : Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;

    if (balance < daysNeeded) {
      throw new ApiError(400, `Insufficient ${leaveType} leave balance. Available: ${balance} days, Requested: ${daysNeeded} days.`);
    }
  }

  const leave = await Leave.create({
    ...req.body,
    user: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: 'Leave application submitted.',
    data: leave,
  });
});

const getMyLeaves = asyncHandler(async (req, res) => {
  const {
    page = PAGINATION.defaultPage,
    limit = PAGINATION.defaultLimit,
    status,
    year,
  } = req.query;

  const pageNum = parseInt(page);
  const limitNum = Math.min(parseInt(limit), PAGINATION.maxLimit);

  const filter = { user: req.user._id };
  if (status) filter.status = status;
  if (year) {
    filter.startDate = {
      $gte: new Date(`${year}-01-01`),
      $lte: new Date(`${year}-12-31`),
    };
  }

  const [leaves, total] = await Promise.all([
    Leave.find(filter)
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Leave.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: leaves,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});

const getLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id)
    .populate('user', 'firstName lastName employeeId department')
    .populate('approvedBy', 'firstName lastName');

  if (!leave) {
    throw new ApiError(404, 'Leave application not found.');
  }

  // Employees can only view their own leaves
  if (req.user.role === 'employee' && String(leave.user._id) !== String(req.user._id)) {
    throw new ApiError(403, 'Not authorized to view this leave application.');
  }

  res.json({
    success: true,
    data: leave,
  });
});

const cancelLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id);

  if (!leave) {
    throw new ApiError(404, 'Leave application not found.');
  }

  if (String(leave.user) !== String(req.user._id)) {
    throw new ApiError(403, 'You can only cancel your own leave applications.');
  }

  if (leave.status !== 'pending') {
    throw new ApiError(400, 'Only pending leave applications can be cancelled.');
  }

  leave.status = 'cancelled';
  await leave.save();

  res.json({
    success: true,
    message: 'Leave application cancelled.',
    data: leave,
  });
});

const getPendingLeaves = asyncHandler(async (req, res) => {
  const {
    page = PAGINATION.defaultPage,
    limit = PAGINATION.defaultLimit,
  } = req.query;

  const pageNum = parseInt(page);
  const limitNum = Math.min(parseInt(limit), PAGINATION.maxLimit);

  let userFilter = {};
  if (req.user.role === 'manager') {
    const deptUsers = await User.find({ department: req.user.department }).select('_id');
    userFilter = { user: { $in: deptUsers.map((u) => u._id) } };
  }

  const filter = { status: 'pending', ...userFilter };

  const [leaves, total] = await Promise.all([
    Leave.find(filter)
      .populate('user', 'firstName lastName employeeId department avatar')
      .sort({ createdAt: 1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Leave.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: leaves,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});

const approveLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id).populate('user');

  if (!leave) {
    throw new ApiError(404, 'Leave application not found.');
  }

  if (leave.status !== 'pending') {
    throw new ApiError(400, 'This leave is no longer pending.');
  }

  // Managers can only approve leaves in their department
  if (req.user.role === 'manager') {
    const leaveUser = await User.findById(leave.user._id);
    if (String(leaveUser.department) !== String(req.user.department)) {
      throw new ApiError(403, 'Not authorized to approve this leave.');
    }
  }

  // Deduct leave balance
  if (leave.leaveType !== 'unpaid') {
    const user = await User.findById(leave.user._id);
    user.leaveBalances[leave.leaveType] -= leave.totalDays;
    if (user.leaveBalances[leave.leaveType] < 0) {
      throw new ApiError(400, 'Insufficient leave balance.');
    }
    await user.save({ validateBeforeSave: false });
  }

  leave.status = 'approved';
  leave.approvedBy = req.user._id;
  leave.approvedAt = new Date();
  await leave.save();

  res.json({
    success: true,
    message: 'Leave approved.',
    data: leave,
  });
});

const rejectLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id);

  if (!leave) {
    throw new ApiError(404, 'Leave application not found.');
  }

  if (leave.status !== 'pending') {
    throw new ApiError(400, 'This leave is no longer pending.');
  }

  if (req.user.role === 'manager') {
    const leaveUser = await User.findById(leave.user);
    if (String(leaveUser.department) !== String(req.user.department)) {
      throw new ApiError(403, 'Not authorized to reject this leave.');
    }
  }

  leave.status = 'rejected';
  leave.approvedBy = req.user._id;
  leave.rejectionReason = req.body.rejectionReason;
  await leave.save();

  res.json({
    success: true,
    message: 'Leave rejected.',
    data: leave,
  });
});

const getTeamLeaves = asyncHandler(async (req, res) => {
  const { startDate, endDate, status } = req.query;

  let userFilter = {};
  if (req.user.role === 'manager') {
    const deptUsers = await User.find({ department: req.user.department }).select('_id');
    userFilter = { user: { $in: deptUsers.map((u) => u._id) } };
  }

  const filter = { ...userFilter };
  if (status) filter.status = status;
  if (startDate || endDate) {
    filter.startDate = {};
    if (startDate) filter.startDate.$gte = new Date(startDate);
    if (endDate) filter.startDate.$lte = new Date(endDate);
  }

  const leaves = await Leave.find(filter)
    .populate('user', 'firstName lastName employeeId avatar')
    .sort({ startDate: 1 });

  res.json({
    success: true,
    data: leaves,
  });
});

module.exports = {
  applyLeave,
  getMyLeaves,
  getLeave,
  cancelLeave,
  getPendingLeaves,
  approveLeave,
  rejectLeave,
  getTeamLeaves,
};
