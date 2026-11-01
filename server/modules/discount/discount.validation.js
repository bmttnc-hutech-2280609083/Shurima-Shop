const Joi = require('joi');

const createDiscountSchema = Joi.object({
  code: Joi.string().trim().min(3).max(30).required().messages({
    'string.empty': 'Discount code is required',
    'any.required': 'Discount code is required',
  }),
  name: Joi.string().trim().min(2).max(120).required().messages({
    'string.empty': 'Discount name is required',
    'any.required': 'Discount name is required',
  }),
  description: Joi.string().trim().allow('').optional(),
  type: Joi.string().valid('percent', 'fixed').required().messages({
    'any.only': 'Discount type must be percent or fixed',
    'any.required': 'Discount type is required',
  }),
  value: Joi.number().min(0).required().messages({
    'number.base': 'Discount value must be a number',
    'number.min': 'Discount value cannot be negative',
    'any.required': 'Discount value is required',
  }),
  minOrderValue: Joi.number().min(0).optional().default(0),
  maxDiscount: Joi.number().min(0).allow(null).optional(),
  startDate: Joi.date().iso().required().messages({
    'date.base': 'Start date must be a valid date',
    'any.required': 'Start date is required',
  }),
  endDate: Joi.date().iso().required().messages({
    'date.base': 'End date must be a valid date',
    'any.required': 'End date is required',
  }),
  usageLimit: Joi.number().integer().min(1).allow(null).optional(),
  isActive: Joi.boolean().optional().default(true),
  isPublic: Joi.boolean().optional().default(false),
});

const updateDiscountSchema = Joi.object({
  code: Joi.string().trim().min(3).max(30),
  name: Joi.string().trim().min(2).max(120),
  description: Joi.string().trim().allow(''),
  type: Joi.string().valid('percent', 'fixed'),
  value: Joi.number().min(0),
  minOrderValue: Joi.number().min(0),
  maxDiscount: Joi.number().min(0).allow(null),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso(),
  usageLimit: Joi.number().integer().min(1).allow(null),
  usedCount: Joi.number().integer().min(0),
  isActive: Joi.boolean(),
  isPublic: Joi.boolean(),
})
  .min(1)
  .messages({
    'object.min': 'At least one field is required to update discount',
  });

const applyDiscountSchema = Joi.object({
  orderId: Joi.string().trim().length(24).hex().required().messages({
    'string.length': 'Order id must be a valid id',
    'string.hex': 'Order id must be a valid id',
    'any.required': 'Order id is required',
  }),
  code: Joi.string().trim().min(3).max(30).required().messages({
    'string.empty': 'Discount code is required',
    'any.required': 'Discount code is required',
  }),
});

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      message: error.details.map((d) => d.message).join(', '),
    });
  }

  req.body = value;
  next();
};

module.exports = {
  validateCreateDiscountBody: validate(createDiscountSchema),
  validateUpdateDiscountBody: validate(updateDiscountSchema),
  validateApplyDiscountBody: validate(applyDiscountSchema),
};
