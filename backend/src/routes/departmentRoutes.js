const express = require('express');
const router = express.Router();
const {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  assignManager,
  assignEmployees,
} = require('../controllers/departmentController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const {
  createDepartmentSchema,
  updateDepartmentSchema,
  assignManagerSchema,
  assignEmployeesSchema,
} = require('../validators/departmentValidator');

router.get('/', auth, getDepartments);
router.get('/:id', auth, getDepartment);
router.post('/', auth, authorize('admin'), validate(createDepartmentSchema), createDepartment);
router.put('/:id', auth, authorize('admin'), validate(updateDepartmentSchema), updateDepartment);
router.delete('/:id', auth, authorize('admin'), deleteDepartment);
router.put('/:id/assign-manager', auth, authorize('admin'), validate(assignManagerSchema), assignManager);
router.put('/:id/assign-employees', auth, authorize('admin'), validate(assignEmployeesSchema), assignEmployees);

module.exports = router;
