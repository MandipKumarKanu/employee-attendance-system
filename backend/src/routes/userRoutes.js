const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateLeaveBalances,
  getUsersByDepartment,
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { createUserSchema, updateUserSchema, updateLeaveBalancesSchema } = require('../validators/userValidator');

router.get('/', auth, authorize('admin', 'manager'), getUsers);
router.get('/department/:deptId', auth, authorize('admin', 'manager'), getUsersByDepartment);
router.get('/:id', auth, authorize('admin', 'manager'), getUser);
router.post('/', auth, authorize('admin'), validate(createUserSchema), createUser);
router.put('/:id', auth, authorize('admin'), validate(updateUserSchema), updateUser);
router.delete('/:id', auth, authorize('admin'), deleteUser);
router.put('/:id/leave-balances', auth, authorize('admin'), validate(updateLeaveBalancesSchema), updateLeaveBalances);

module.exports = router;
