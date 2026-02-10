const User = require('../models/User');
const Department = require('../models/Department');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { PAGINATION } = require('../config/constants');

const getUsers = asyncHandler(async (req, res) => {
  const {
    page = PAGINATION.defaultPage,
    limit = PAGINATION.defaultLimit,
    search,
    role,
    department,
    isActive,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const pageNum = parseInt(page);
  const limitNum = Math.min(parseInt(limit), PAGINATION.maxLimit);

  const filter = {};

  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } },
    ];
  }

  if (role) filter.role = role;
  if (department) filter.department = department;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  // Managers can only see employees in their department
  if (req.user.role === 'manager') {
    filter.department = req.user.department;
  }

  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [users, total] = await Promise.all([
    User.find(filter)
      .populate('department', 'name code')
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: users,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate('department', 'name code');

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  // Managers can only view users in their department
  if (req.user.role === 'manager' && String(user.department?._id) !== String(req.user.department)) {
    throw new ApiError(403, 'Not authorized to view this user.');
  }

  res.json({
    success: true,
    data: user,
  });
});

const createUser = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'A user with this email already exists.');
  }

  const user = await User.create(req.body);
  const userObj = user.toObject();
  delete userObj.password;

  res.status(201).json({
    success: true,
    data: userObj,
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const { password, ...updateData } = req.body;

  const user = await User.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  }).populate('department', 'name code');

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  res.json({
    success: true,
    data: user,
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  if (user.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
    if (adminCount <= 1) {
      throw new ApiError(400, 'Cannot deactivate the last admin user.');
    }
  }

  user.isActive = false;
  await user.save({ validateBeforeSave: false });

  // Remove manager assignment if this user was a department manager
  await Department.updateMany({ manager: user._id }, { manager: null });

  res.json({
    success: true,
    message: 'User deactivated successfully.',
  });
});

const updateLeaveBalances = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const { casual, sick, earned, unpaid } = req.body;
  if (casual !== undefined) user.leaveBalances.casual = casual;
  if (sick !== undefined) user.leaveBalances.sick = sick;
  if (earned !== undefined) user.leaveBalances.earned = earned;
  if (unpaid !== undefined) user.leaveBalances.unpaid = unpaid;

  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    data: user,
  });
});

const getUsersByDepartment = asyncHandler(async (req, res) => {
  const { deptId } = req.params;

  // Managers can only view their own department
  if (req.user.role === 'manager' && String(req.user.department) !== deptId) {
    throw new ApiError(403, 'Not authorized to view this department.');
  }

  const users = await User.find({ department: deptId, isActive: true })
    .populate('department', 'name code')
    .sort({ firstName: 1 });

  res.json({
    success: true,
    data: users,
  });
});

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateLeaveBalances,
  getUsersByDepartment,
};
