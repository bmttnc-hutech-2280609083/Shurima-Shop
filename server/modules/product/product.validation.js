const Joi = require('joi');

const objectId = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/, 'valid ObjectId')
  .messages({ 'string.pattern.name': '{{#label}} must be a valid MongoDB ObjectId' });

const createProductSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).required().messages({
    'string.empty': 'Product name cannot be empty',
    'any.required': 'Product name is required',
  }),
  price: Joi.number().min(0).required().messages({
    'number.base': 'Price must be a number',
    'number.min': 'Price cannot be negative',
    'any.required': 'Price is required',
  }),
  description: Joi.string().trim().max(2000).optional().allow(''),
  category: objectId.required().messages({
    'any.required': 'Category is required',
  }),
  brand: objectId.optional().allow(null, ''),
  images: Joi.array().items(Joi.string().uri()).optional().default([]),
  stock: Joi.number().integer().min(0).optional().default(0),
  isActive: Joi.boolean().optional().default(true),
});

const updateProductSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).optional(),
  price: Joi.number().min(0).optional(),
  description: Joi.string().trim().max(2000).optional().allow(''),
  category: objectId.optional(),
  brand: objectId.optional().allow(null, ''),
  images: Joi.array().items(Joi.string().uri()).optional(),
  stock: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

module.exports = { createProductSchema, updateProductSchema };
