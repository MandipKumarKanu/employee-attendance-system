const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required',
  }),
  newPassword: Joi.string().min(8).required().messages({
    'string.min': 'New password must be at least 8 characters',
    'any.required': 'New password is required',
  }),
});

module.exports = { loginSchema, changePasswordSchema };
