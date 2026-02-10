const ApiError = require('../utils/ApiError');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return next(new ApiError(400, 'Validation error', messages));
    }

    next();
  };
};

module.exports = validate;
