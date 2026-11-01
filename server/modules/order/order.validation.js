const Joi = require("joi");

const objectIdRule = Joi.string().trim().length(24).hex();
const statusRule = Joi.string().valid("pending", "shipping", "completed", "cancelled");

const createOrderSchema = Joi.object({
	user: objectIdRule.messages({
		"string.length": "User must be a valid id",
		"string.hex": "User must be a valid id",
	}),
	totalPrice: Joi.number().min(0).optional().messages({
		"number.base": "Total price must be a number",
		"number.min": "Total price must be greater than or equal to 0",
	}),
	status: statusRule.default("pending"),
	address: Joi.string().trim().required().messages({
		"string.empty": "Address is required",
		"any.required": "Address is required",
	}),
});

const updateOrderSchema = Joi.object({
	user: objectIdRule.messages({
		"string.length": "User must be a valid id",
		"string.hex": "User must be a valid id",
	}),
	totalPrice: Joi.number().min(0).messages({
		"number.base": "Total price must be a number",
		"number.min": "Total price must be greater than or equal to 0",
	}),
	status: statusRule,
	address: Joi.string().trim(),
})
	.min(1)
	.messages({
		"object.min": "At least one field is required to update order",
	});

const validate = (schema) => (req, res, next) => {
	const { error, value } = schema.validate(req.body, { abortEarly: false });

	if (error) {
		return res.status(400).json({
			message: error.details.map((d) => d.message).join(", "),
		});
	}

	req.body = value;
	next();
};

module.exports = {
	validateCreateOrderBody: validate(createOrderSchema),
	validateUpdateOrderBody: validate(updateOrderSchema),
};
