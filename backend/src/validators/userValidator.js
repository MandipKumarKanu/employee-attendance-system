const Joi = require('joi');

const createUserSchema = Joi.object({
  firstName: Joi.string().trim().max(50).required(),
  lastName: Joi.string().trim().max(50).required(),
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('admin', 'manager', 'employee').default('employee'),
  department: Joi.string().allow(null, ''),
  phone: Joi.string().allow(null, ''),
  joiningDate: Joi.date().allow(null),
  officeLocation: Joi.object({
    latitude: Joi.number(),
    longitude: Joi.number(),
    radiusMeters: Joi.number().default(200),
  }).allow(null),
});

const updateUserSchema = Joi.object({
  firstName: Joi.string().trim().max(50),
  lastName: Joi.string().trim().max(50),
  email: Joi.string().email({ tlds: { allow: false } }),
  role: Joi.string().valid('admin', 'manager', 'employee'),
  department: Joi.string().allow(null, ''),
  phone: Joi.string().allow(null, ''),
  isActive: Joi.boolean(),
  joiningDate: Joi.date(),
  officeLocation: Joi.object({
    latitude: Joi.number(),
    longitude: Joi.number(),
    radiusMeters: Joi.number(),
  }),
});

const updateLeaveBalancesSchema = Joi.object({
  casual: Joi.number().min(0),
  sick: Joi.number().min(0),
  earned: Joi.number().min(0),
  unpaid: Joi.number().min(0),
});

module.exports = { createUserSchema, updateUserSchema, updateLeaveBalancesSchema };
