const Joi = require('joi');

const applyLeaveSchema = Joi.object({
  leaveType: Joi.string().valid('casual', 'sick', 'earned', 'unpaid').required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().min(Joi.ref('startDate')).required(),
  isHalfDay: Joi.boolean().default(false),
  halfDayPeriod: Joi.string().valid('morning', 'afternoon').when('isHalfDay', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  reason: Joi.string().max(500).required(),
});

const rejectLeaveSchema = Joi.object({
  rejectionReason: Joi.string().max(500).required(),
});

module.exports = { applyLeaveSchema, rejectLeaveSchema };
