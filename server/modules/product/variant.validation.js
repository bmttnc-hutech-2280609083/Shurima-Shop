const Joi = require('joi');

const validateObjectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Must be a valid ObjectId'
});

const variantSchema = Joi.object({
  productId: validateObjectId.required().messages({
    'any.required': 'productId is required'
  }),
  size: Joi.string().required().messages({
    'any.required': 'size is required'
  }),
  color: Joi.string().required().messages({
    'any.required': 'color is required'
  }),
  stock: Joi.number().min(0).optional().default(0),
  price: Joi.number().min(0).optional()
});

const updateVariantSchema = Joi.object({
  size: Joi.string().optional(),
  color: Joi.string().optional(),
  stock: Joi.number().min(0).optional(),
  price: Joi.number().min(0).optional()
});

module.exports = {
  variantSchema,
  updateVariantSchema
};
