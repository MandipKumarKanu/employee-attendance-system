const Attendance = require('../models/Attendance');
const User = require('../models/User');
const QRSession = require('../models/QRSession');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { isWithinGeofence } = require('../utils/geoUtils');
const { PAGINATION } = require('../config/constants');

const getStartOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const checkIn = asyncHandler(async (req, res) => {
  const { method, location } = req.body;
  const today = getStartOfDay();

  const existing = await Attendance.findOne({ user: req.user._id, date: today });
  if (existing && existing.checkIn?.time) {
    throw new ApiError(400, 'You have already checked in today.');
  }

  let withinGeofence = null;
  if (method === 'gps' && location) {
    const user = await User.findById(req.user._id);
    const officeLoc = user.officeLocation;

    if (officeLoc?.latitude && officeLoc?.longitude) {
      const result = isWithinGeofence(
        location.latitude,
        location.longitude,
        officeLoc.latitude,
        officeLoc.longitude,
        officeLoc.radiusMeters || 200
      );
      withinGeofence = result.withinGeofence;

      if (!withinGeofence) {
        throw new ApiError(400, `You are ${result.distance}m away from the office. Must be within ${officeLoc.radiusMeters || 200}m.`);
      }
    }
  }

  const attendanceData = {
    user: req.user._id,
    date: today,
    checkIn: {
      time: new Date(),
      method,
      location: location || undefined,
      withinGeofence,
      ipAddress: req.ip,
    },
  };

  const attendance = existing
    ? Object.assign(existing, attendanceData) && await existing.save()
    : await Attendance.create(attendanceData);

  res.status(201).json({
    success: true,
    message: 'Checked in successfully.',
    data: attendance,
  });
});

const checkOut = asyncHandler(async (req, res) => {
  const { method, location } = req.body;
  const today = getStartOfDay();

  const attendance = await Attendance.findOne({ user: req.user._id, date: today });

  if (!attendance || !attendance.checkIn?.time) {
    throw new ApiError(400, 'You have not checked in today.');
  }

  if (attendance.checkOut?.time) {
    throw new ApiError(400, 'You have already checked out today.');
  }

  let withinGeofence = null;
  if (method === 'gps' && location) {
    const user = await User.findById(req.user._id);
    const officeLoc = user.officeLocation;

    if (officeLoc?.latitude && officeLoc?.longitude) {
      const result = isWithinGeofence(
        location.latitude,
        location.longitude,
        officeLoc.latitude,
        officeLoc.longitude,
        officeLoc.radiusMeters || 200
      );
      withinGeofence = result.withinGeofence;
    }
  }

  attendance.checkOut = {
    time: new Date(),
    method,
    location: location || undefined,
    withinGeofence,
  };

  await attendance.save();

  res.json({
    success: true,
    message: 'Checked out successfully.',
    data: attendance,
  });
});

const qrCheckIn = asyncHandler(async (req, res) => {
  const { token, location } = req.body;
  const today = getStartOfDay();

  const session = await QRSession.findOne({ token, type: 'checkin' });
  if (!session) {
    throw new ApiError(400, 'Invalid QR code.');
  }

  if (new Date() > session.expiresAt) {
    throw new ApiError(400, 'QR code has expired.');
  }

  if (session.usedBy.includes(req.user._id)) {
    throw new ApiError(400, 'You have already used this QR code.');
  }

  const existing = await Attendance.findOne({ user: req.user._id, date: today });
  if (existing && existing.checkIn?.time) {
    throw new ApiError(400, 'You have already checked in today.');
  }

  session.usedBy.push(req.user._id);
  await session.save();

  const attendanceData = {
    user: req.user._id,
    date: today,
    checkIn: {
      time: new Date(),
      method: 'qr',
      location: location || undefined,
      ipAddress: req.ip,
    },
  };

  const attendance = await Attendance.create(attendanceData);

  res.status(201).json({
    success: true,
    message: 'Checked in via QR code.',
    data: attendance,
  });
});

const qrCheckOut = asyncHandler(async (req, res) => {
  const { token, location } = req.body;
  const today = getStartOfDay();

  const session = await QRSession.findOne({ token, type: 'checkout' });
  if (!session) {
    throw new ApiError(400, 'Invalid QR code.');
  }

  if (new Date() > session.expiresAt) {
    throw new ApiError(400, 'QR code has expired.');
  }

  const attendance = await Attendance.findOne({ user: req.user._id, date: today });
  if (!attendance || !attendance.checkIn?.time) {
    throw new ApiError(400, 'You have not checked in today.');
  }

  if (attendance.checkOut?.time) {
    throw new ApiError(400, 'You have already checked out today.');
  }

  session.usedBy.push(req.user._id);
  await session.save();

  attendance.checkOut = {
    time: new Date(),
    method: 'qr',
    location: location || undefined,
  };

  await attendance.save();

  res.json({
    success: true,
    message: 'Checked out via QR code.',
    data: attendance,
  });
});

const getToday = asyncHandler(async (req, res) => {
  const today = getStartOfDay();
  const attendance = await Attendance.findOne({ user: req.user._id, date: today });

  res.json({
    success: true,
    data: attendance,
  });
});

const getMyHistory = asyncHandler(async (req, res) => {
  const {
    page = PAGINATION.defaultPage,
    limit = PAGINATION.defaultLimit,
    startDate,
    endDate,
    status,
  } = req.query;

  const pageNum = parseInt(page);
  const limitNum = Math.min(parseInt(limit), PAGINATION.maxLimit);

  const filter = { user: req.user._id };
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  if (status) filter.status = status;

  const [records, total] = await Promise.all([
    Attendance.find(filter)
      .sort({ date: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Attendance.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: records,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});

const getTeamAttendance = asyncHandler(async (req, res) => {
  const { date, startDate, endDate } = req.query;

  let userFilter = { isActive: true };
  if (req.user.role === 'manager') {
    userFilter.department = req.user.department;
  }

  const teamUsers = await User.find(userFilter).select('_id firstName lastName employeeId avatar');
  const userIds = teamUsers.map((u) => u._id);

  const dateFilter = {};
  if (date) {
    dateFilter.date = getStartOfDay(new Date(date));
  } else if (startDate || endDate) {
    dateFilter.date = {};
    if (startDate) dateFilter.date.$gte = new Date(startDate);
    if (endDate) dateFilter.date.$lte = new Date(endDate);
  } else {
    dateFilter.date = getStartOfDay();
  }

  const records = await Attendance.find({
    user: { $in: userIds },
    ...dateFilter,
  }).populate('user', 'firstName lastName employeeId avatar');

  res.json({
    success: true,
    data: { teamUsers, records },
  });
});

const getAllAttendance = asyncHandler(async (req, res) => {
  const {
    page = PAGINATION.defaultPage,
    limit = PAGINATION.defaultLimit,
    startDate,
    endDate,
    status,
    department,
    userId,
  } = req.query;

  const pageNum = parseInt(page);
  const limitNum = Math.min(parseInt(limit), PAGINATION.maxLimit);

  const filter = {};
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  if (status) filter.status = status;
  if (userId) filter.user = userId;

  if (department) {
    const deptUsers = await User.find({ department }).select('_id');
    filter.user = { $in: deptUsers.map((u) => u._id) };
  }

  const [records, total] = await Promise.all([
    Attendance.find(filter)
      .populate('user', 'firstName lastName employeeId avatar department')
      .sort({ date: -1, 'checkIn.time': -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Attendance.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: records,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});

const getUserAttendance = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const {
    page = PAGINATION.defaultPage,
    limit = PAGINATION.defaultLimit,
    startDate,
    endDate,
  } = req.query;

  const pageNum = parseInt(page);
  const limitNum = Math.min(parseInt(limit), PAGINATION.maxLimit);

  // Verify manager can access this user
  if (req.user.role === 'manager') {
    const targetUser = await User.findById(userId);
    if (!targetUser || String(targetUser.department) !== String(req.user.department)) {
      throw new ApiError(403, 'Not authorized to view this user\'s attendance.');
    }
  }

  const filter = { user: userId };
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const [records, total] = await Promise.all([
    Attendance.find(filter)
      .sort({ date: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Attendance.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: records,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});

const reviewAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findById(req.params.id);

  if (!attendance) {
    throw new ApiError(404, 'Attendance record not found.');
  }

  attendance.isReviewed = true;
  attendance.reviewedBy = req.user._id;
  if (req.body.notes) attendance.notes = req.body.notes;

  await attendance.save();

  res.json({
    success: true,
    data: attendance,
  });
});

const updateAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findById(req.params.id);

  if (!attendance) {
    throw new ApiError(404, 'Attendance record not found.');
  }

  const { checkInTime, checkOutTime, status, notes } = req.body;

  if (checkInTime) attendance.checkIn.time = new Date(checkInTime);
  if (checkOutTime) attendance.checkOut = { ...attendance.checkOut, time: new Date(checkOutTime) };
  if (status) attendance.status = status;
  if (notes !== undefined) attendance.notes = notes;

  await attendance.save();

  res.json({
    success: true,
    data: attendance,
  });
});

module.exports = {
  checkIn,
  checkOut,
  qrCheckIn,
  qrCheckOut,
  getToday,
  getMyHistory,
  getTeamAttendance,
  getAllAttendance,
  getUserAttendance,
  reviewAttendance,
  updateAttendance,
};
