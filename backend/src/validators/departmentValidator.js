const Joi = require('joi');

const createDepartmentSchema = Joi.object({
  name: Joi.string().trim().required(),
  code: Joi.string().trim().uppercase().required(),
  description: Joi.string().max(300),
  manager: Joi.string().allow(null, ''),
  officeLocation: Joi.object({
    address: Joi.string(),
    latitude: Joi.number(),
    longitude: Joi.number(),
    radiusMeters: Joi.number().default(200),
  }),
});

const updateDepartmentSchema = Joi.object({
  name: Joi.string().trim(),
  code: Joi.string().trim().uppercase(),
  description: Joi.string().max(300),
  manager: Joi.string().allow(null, ''),
  isActive: Joi.boolean(),
  officeLocation: Joi.object({
    address: Joi.string(),
    latitude: Joi.number(),
    longitude: Joi.number(),
    radiusMeters: Joi.number(),
  }),
});

const assignManagerSchema = Joi.object({
  managerId: Joi.string().required(),
});

const assignEmployeesSchema = Joi.object({
  userIds: Joi.array().items(Joi.string()).min(1).required(),
});

module.exports = {
  createDepartmentSchema,
  updateDepartmentSchema,
  assignManagerSchema,
  assignEmployeesSchema,
};
