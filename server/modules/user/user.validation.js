const Joi = require('joi');

const createUserSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().pattern(/^[0-9]{10,11}$/),
    address: Joi.string().min(5),
    role: Joi.string().valid('user', 'admin').default('user')
});

const updateUserSchema = Joi.object({
    name: Joi.string().min(2).max(50),
    phone: Joi.string().pattern(/^[0-9]{10,11}$/),
    address: Joi.string().min(5),
    avatar: Joi.string().allow('')
}).min(1);

module.exports = { createUserSchema, updateUserSchema };
