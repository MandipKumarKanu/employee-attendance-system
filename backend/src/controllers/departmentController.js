const Department = require('../models/Department');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find({ isActive: true })
    .populate('manager', 'firstName lastName email')
    .populate('employees');

  res.json({
    success: true,
    data: departments,
  });
});

const getDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id)
    .populate('manager', 'firstName lastName email employeeId');

  if (!department) {
    throw new ApiError(404, 'Department not found.');
  }

  const employees = await User.find({ department: department._id, isActive: true })
    .select('firstName lastName email employeeId role avatar')
    .sort({ firstName: 1 });

  res.json({
    success: true,
    data: { ...department.toObject(), employeeList: employees },
  });
});

const createDepartment = asyncHandler(async (req, res) => {
  const department = await Department.create(req.body);

  res.status(201).json({
    success: true,
    data: department,
  });
});

const updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('manager', 'firstName lastName email');

  if (!department) {
    throw new ApiError(404, 'Department not found.');
  }

  res.json({
    success: true,
    data: department,
  });
});

const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);

  if (!department) {
    throw new ApiError(404, 'Department not found.');
  }

  const employeeCount = await User.countDocuments({ department: department._id, isActive: true });
  if (employeeCount > 0) {
    throw new ApiError(400, `Cannot delete department with ${employeeCount} active employees. Reassign them first.`);
  }

  department.isActive = false;
  await department.save();

  res.json({
    success: true,
    message: 'Department deactivated.',
  });
});

const assignManager = asyncHandler(async (req, res) => {
  const { managerId } = req.body;
  const department = await Department.findById(req.params.id);

  if (!department) {
    throw new ApiError(404, 'Department not found.');
  }

  const manager = await User.findById(managerId);
  if (!manager) {
    throw new ApiError(404, 'User not found.');
  }

  if (manager.role !== 'manager' && manager.role !== 'admin') {
    throw new ApiError(400, 'User must have manager or admin role.');
  }

  department.manager = managerId;
  await department.save();

  // Update manager's department
  manager.department = department._id;
  await manager.save({ validateBeforeSave: false });

  const updated = await Department.findById(department._id)
    .populate('manager', 'firstName lastName email');

  res.json({
    success: true,
    data: updated,
  });
});

const assignEmployees = asyncHandler(async (req, res) => {
  const { userIds } = req.body;
  const department = await Department.findById(req.params.id);

  if (!department) {
    throw new ApiError(404, 'Department not found.');
  }

  await User.updateMany(
    { _id: { $in: userIds } },
    { department: department._id }
  );

  const employees = await User.find({ department: department._id, isActive: true })
    .select('firstName lastName email employeeId role');

  res.json({
    success: true,
    message: `${userIds.length} employees assigned to ${department.name}.`,
    data: employees,
  });
});

module.exports = {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  assignManager,
  assignEmployees,
};
