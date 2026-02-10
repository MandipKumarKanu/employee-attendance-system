const express = require('express');
const router = express.Router();
const {
  attendanceSummary,
  departmentBreakdown,
  leaveAnalytics,
  employeeReport,
  monthlyOverview,
  exportCSV,
  exportPDF,
} = require('../controllers/reportController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/attendance-summary', auth, authorize('admin', 'manager'), attendanceSummary);
router.get('/department-breakdown', auth, authorize('admin'), departmentBreakdown);
router.get('/leave-analytics', auth, authorize('admin', 'manager'), leaveAnalytics);
router.get('/employee-report/:userId', auth, authorize('admin', 'manager'), employeeReport);
router.get('/monthly-overview', auth, authorize('admin', 'manager'), monthlyOverview);
router.get('/export/csv', auth, authorize('admin', 'manager'), exportCSV);
router.get('/export/pdf', auth, authorize('admin', 'manager'), exportPDF);

module.exports = router;
