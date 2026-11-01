const Joi = require('joi');

const createReviewSchema = Joi.object({
    userId: Joi.string().optional(),
    productId: Joi.string().required(),
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().allow('').optional()
});

const updateReviewSchema = Joi.object({
    rating: Joi.number().min(1).max(5),
    comment: Joi.string().allow('')
}).min(1);

module.exports = { createReviewSchema, updateReviewSchema };
