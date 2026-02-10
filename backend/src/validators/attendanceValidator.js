const Joi = require('joi');

const checkInSchema = Joi.object({
  method: Joi.string().valid('manual', 'gps').required(),
  location: Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
  }).when('method', {
    is: 'gps',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});

const checkOutSchema = Joi.object({
  method: Joi.string().valid('manual', 'gps').required(),
  location: Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
  }).when('method', {
    is: 'gps',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});

const qrCheckSchema = Joi.object({
  token: Joi.string().required(),
  location: Joi.object({
    latitude: Joi.number(),
    longitude: Joi.number(),
  }),
});

const reviewSchema = Joi.object({
  notes: Joi.string().max(500),
});

const updateAttendanceSchema = Joi.object({
  checkInTime: Joi.date(),
  checkOutTime: Joi.date(),
  status: Joi.string().valid('present', 'absent', 'late', 'half-day', 'on-leave', 'holiday', 'weekend'),
  notes: Joi.string().max(500),
});

module.exports = {
  checkInSchema,
  checkOutSchema,
  qrCheckSchema,
  reviewSchema,
  updateAttendanceSchema,
};
