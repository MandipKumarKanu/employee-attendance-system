const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getLeave,
  cancelLeave,
  getPendingLeaves,
  approveLeave,
  rejectLeave,
  getTeamLeaves,
} = require('../controllers/leaveController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { applyLeaveSchema, rejectLeaveSchema } = require('../validators/leaveValidator');

router.post('/', auth, validate(applyLeaveSchema), applyLeave);
router.get('/my', auth, getMyLeaves);
router.get('/pending', auth, authorize('manager', 'admin'), getPendingLeaves);
router.get('/team', auth, authorize('manager', 'admin'), getTeamLeaves);
router.get('/:id', auth, getLeave);
router.put('/:id/cancel', auth, cancelLeave);
router.put('/:id/approve', auth, authorize('manager', 'admin'), approveLeave);
router.put('/:id/reject', auth, authorize('manager', 'admin'), validate(rejectLeaveSchema), rejectLeave);

module.exports = router;
