const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const User = require('../models/User');
const Department = require('../models/Department');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');

const attendanceSummary = asyncHandler(async (req, res) => {
  const { startDate, endDate, department } = req.query;

  const matchStage = {};
  if (startDate || endDate) {
    matchStage.date = {};
    if (startDate) matchStage.date.$gte = new Date(startDate);
    if (endDate) matchStage.date.$lte = new Date(endDate);
  }

  if (department) {
    const deptUsers = await User.find({ department }).select('_id');
    matchStage.user = { $in: deptUsers.map((u) => u._id) };
  } else if (req.user.role === 'manager') {
    const deptUsers = await User.find({ department: req.user.department }).select('_id');
    matchStage.user = { $in: deptUsers.map((u) => u._id) };
  }

  const summary = await Attendance.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        totalPresent: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
        totalLate: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
        totalAbsent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
        totalOnLeave: { $sum: { $cond: [{ $eq: ['$status', 'on-leave'] }, 1, 0] } },
        totalHalfDay: { $sum: { $cond: [{ $eq: ['$status', 'half-day'] }, 1, 0] } },
        avgHours: { $avg: '$totalHours' },
        totalRecords: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    success: true,
    data: summary,
  });
});

const departmentBreakdown = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const departments = await Department.find({ isActive: true });
  const breakdown = [];

  for (const dept of departments) {
    const deptUsers = await User.find({ department: dept._id, isActive: true }).select('_id');
    const userIds = deptUsers.map((u) => u._id);

    const matchStage = { user: { $in: userIds } };
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    const stats = await Attendance.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          totalPresent: { $sum: { $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0] } },
          avgHours: { $avg: '$totalHours' },
        },
      },
    ]);

    breakdown.push({
      department: { _id: dept._id, name: dept.name, code: dept.code },
      employeeCount: deptUsers.length,
      stats: stats[0] || { totalRecords: 0, totalPresent: 0, avgHours: 0 },
      attendanceRate: stats[0]
        ? Math.round((stats[0].totalPresent / stats[0].totalRecords) * 100)
        : 0,
    });
  }

  res.json({
    success: true,
    data: breakdown,
  });
});

const leaveAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const matchStage = {};
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  if (req.user.role === 'manager') {
    const deptUsers = await User.find({ department: req.user.department }).select('_id');
    matchStage.user = { $in: deptUsers.map((u) => u._id) };
  }

  const [byType, byStatus, monthly] = await Promise.all([
    Leave.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$leaveType',
          count: { $sum: 1 },
          totalDays: { $sum: '$totalDays' },
        },
      },
    ]),
    Leave.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),
    Leave.aggregate([
      { $match: { ...matchStage, status: 'approved' } },
      {
        $group: {
          _id: {
            year: { $year: '$startDate' },
            month: { $month: '$startDate' },
          },
          count: { $sum: 1 },
          totalDays: { $sum: '$totalDays' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  res.json({
    success: true,
    data: { byType, byStatus, monthly },
  });
});

const employeeReport = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { startDate, endDate } = req.query;

  const user = await User.findById(userId).populate('department', 'name code');
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const matchStage = { user: user._id };
  if (startDate || endDate) {
    matchStage.date = {};
    if (startDate) matchStage.date.$gte = new Date(startDate);
    if (endDate) matchStage.date.$lte = new Date(endDate);
  }

  const [attendanceStats, leaves] = await Promise.all([
    Attendance.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgHours: { $avg: '$totalHours' },
        },
      },
    ]),
    Leave.find({ user: userId, status: 'approved' })
      .sort({ startDate: -1 })
      .limit(10),
  ]);

  res.json({
    success: true,
    data: {
      user,
      attendanceStats,
      leaveBalances: user.leaveBalances,
      recentLeaves: leaves,
    },
  });
});

const monthlyOverview = asyncHandler(async (req, res) => {
  const { year = new Date().getFullYear() } = req.query;

  const matchStage = {
    date: {
      $gte: new Date(`${year}-01-01`),
      $lte: new Date(`${year}-12-31`),
    },
  };

  if (req.user.role === 'manager') {
    const deptUsers = await User.find({ department: req.user.department }).select('_id');
    matchStage.user = { $in: deptUsers.map((u) => u._id) };
  }

  const overview = await Attendance.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { month: { $month: '$date' } },
        totalRecords: { $sum: 1 },
        totalPresent: { $sum: { $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0] } },
        totalLate: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
        avgHours: { $avg: '$totalHours' },
      },
    },
    { $sort: { '_id.month': 1 } },
  ]);

  res.json({
    success: true,
    data: overview,
  });
});

const exportCSV = asyncHandler(async (req, res) => {
  const { startDate, endDate, department } = req.query;

  const filter = {};
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  if (department) {
    const deptUsers = await User.find({ department }).select('_id');
    filter.user = { $in: deptUsers.map((u) => u._id) };
  }

  const records = await Attendance.find(filter)
    .populate('user', 'firstName lastName employeeId email')
    .sort({ date: -1 });

  const data = records.map((r) => ({
    'Employee ID': r.user?.employeeId || '',
    'Name': r.user ? `${r.user.firstName} ${r.user.lastName}` : '',
    'Email': r.user?.email || '',
    'Date': r.date.toISOString().split('T')[0],
    'Check In': r.checkIn?.time ? new Date(r.checkIn.time).toLocaleTimeString() : '',
    'Check Out': r.checkOut?.time ? new Date(r.checkOut.time).toLocaleTimeString() : '',
    'Total Hours': r.totalHours || 0,
    'Status': r.status,
    'Method': r.checkIn?.method || '',
  }));

  const parser = new Parser();
  const csv = parser.parse(data);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.csv');
  res.send(csv);
});

const exportPDF = asyncHandler(async (req, res) => {
  const { startDate, endDate, department } = req.query;

  const filter = {};
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  if (department) {
    const deptUsers = await User.find({ department }).select('_id');
    filter.user = { $in: deptUsers.map((u) => u._id) };
  }

  const records = await Attendance.find(filter)
    .populate('user', 'firstName lastName employeeId')
    .sort({ date: -1 })
    .limit(500);

  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.pdf');
  doc.pipe(res);

  // Title
  doc.fontSize(20).font('Helvetica-Bold').text('Attendance Report', { align: 'center' });
  doc.moveDown();

  if (startDate || endDate) {
    doc.fontSize(10).font('Helvetica').text(
      `Period: ${startDate || 'Start'} to ${endDate || 'Present'}`,
      { align: 'center' }
    );
    doc.moveDown();
  }

  // Table header
  const tableTop = doc.y + 10;
  doc.fontSize(9).font('Helvetica-Bold');
  doc.text('Emp ID', 50, tableTop, { width: 70 });
  doc.text('Name', 120, tableTop, { width: 120 });
  doc.text('Date', 240, tableTop, { width: 80 });
  doc.text('In', 320, tableTop, { width: 60 });
  doc.text('Out', 380, tableTop, { width: 60 });
  doc.text('Hours', 440, tableTop, { width: 50 });
  doc.text('Status', 490, tableTop, { width: 60 });

  doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

  // Table rows
  let y = tableTop + 25;
  doc.font('Helvetica').fontSize(8);

  for (const record of records) {
    if (y > 720) {
      doc.addPage();
      y = 50;
    }

    doc.text(record.user?.employeeId || '', 50, y, { width: 70 });
    doc.text(record.user ? `${record.user.firstName} ${record.user.lastName}` : '', 120, y, { width: 120 });
    doc.text(record.date.toISOString().split('T')[0], 240, y, { width: 80 });
    doc.text(record.checkIn?.time ? new Date(record.checkIn.time).toLocaleTimeString() : '-', 320, y, { width: 60 });
    doc.text(record.checkOut?.time ? new Date(record.checkOut.time).toLocaleTimeString() : '-', 380, y, { width: 60 });
    doc.text(String(record.totalHours || 0), 440, y, { width: 50 });
    doc.text(record.status, 490, y, { width: 60 });

    y += 18;
  }

  doc.end();
});

module.exports = {
  attendanceSummary,
  departmentBreakdown,
  leaveAnalytics,
  employeeReport,
  monthlyOverview,
  exportCSV,
  exportPDF,
};
