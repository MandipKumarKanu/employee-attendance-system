const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/attendanceController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const {
  checkInSchema,
  checkOutSchema,
  qrCheckSchema,
  reviewSchema,
  updateAttendanceSchema,
} = require('../validators/attendanceValidator');

router.post('/check-in', auth, validate(checkInSchema), checkIn);
router.post('/check-out', auth, validate(checkOutSchema), checkOut);
router.post('/qr-check-in', auth, validate(qrCheckSchema), qrCheckIn);
router.post('/qr-check-out', auth, validate(qrCheckSchema), qrCheckOut);
router.get('/today', auth, getToday);
router.get('/my-history', auth, getMyHistory);
router.get('/team', auth, authorize('manager', 'admin'), getTeamAttendance);
router.get('/all', auth, authorize('admin'), getAllAttendance);
router.get('/user/:userId', auth, authorize('admin', 'manager'), getUserAttendance);
router.put('/:id/review', auth, authorize('admin', 'manager'), validate(reviewSchema), reviewAttendance);
router.put('/:id', auth, authorize('admin'), validate(updateAttendanceSchema), updateAttendance);

module.exports = router;
