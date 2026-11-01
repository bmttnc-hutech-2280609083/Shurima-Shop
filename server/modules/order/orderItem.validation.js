const Joi = require("joi");

const objectIdRule = Joi.string().trim().length(24).hex();

const createOrderItemSchema = Joi.object({
	order: objectIdRule.required().messages({
		"string.empty": "Order is required",
		"string.length": "Order must be a valid id",
		"string.hex": "Order must be a valid id",
		"any.required": "Order is required",
	}),
	product: objectIdRule.required().messages({
		"string.empty": "Product is required",
		"string.length": "Product must be a valid id",
		"string.hex": "Product must be a valid id",
		"any.required": "Product is required",
	}),
	variant: objectIdRule.allow(null).messages({
		"string.length": "Variant must be a valid id",
		"string.hex": "Variant must be a valid id",
	}),
	quantity: Joi.number().integer().min(1).required().messages({
		"number.base": "Quantity must be a number",
		"number.integer": "Quantity must be an integer",
		"number.min": "Quantity must be at least 1",
		"any.required": "Quantity is required",
	}),
	price: Joi.number().min(0).optional().messages({
		"number.base": "Price must be a number",
		"number.min": "Price must be greater than or equal to 0",
	}),
});

const updateOrderItemSchema = Joi.object({
	order: objectIdRule.messages({
		"string.length": "Order must be a valid id",
		"string.hex": "Order must be a valid id",
	}),
	product: objectIdRule.messages({
		"string.length": "Product must be a valid id",
		"string.hex": "Product must be a valid id",
	}),
	variant: objectIdRule.allow(null).messages({
		"string.length": "Variant must be a valid id",
		"string.hex": "Variant must be a valid id",
	}),
	quantity: Joi.number().integer().min(1).messages({
		"number.base": "Quantity must be a number",
		"number.integer": "Quantity must be an integer",
		"number.min": "Quantity must be at least 1",
	}),
	price: Joi.number().min(0).messages({
		"number.base": "Price must be a number",
		"number.min": "Price must be greater than or equal to 0",
	}),
})
	.min(1)
	.messages({
		"object.min": "At least one field is required to update order item",
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
	validateCreateOrderItemBody: validate(createOrderItemSchema),
	validateUpdateOrderItemBody: validate(updateOrderItemSchema),
};
