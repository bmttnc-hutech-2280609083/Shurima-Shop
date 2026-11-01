const Joi = require("joi");

const objectIdRule = Joi.string().trim().length(24).hex();

const createCartItemSchema = Joi.object({
	cart: objectIdRule.required().messages({
		"string.empty": "Cart is required",
		"string.length": "Cart must be a valid id",
		"string.hex": "Cart must be a valid id",
		"any.required": "Cart is required",
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
});

const updateCartItemSchema = Joi.object({
	cart: objectIdRule.messages({
		"string.length": "Cart must be a valid id",
		"string.hex": "Cart must be a valid id",
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
})
	.min(1)
	.messages({
		"object.min": "At least one field is required to update cart item",
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
	validateCreateCartItemBody: validate(createCartItemSchema),
	validateUpdateCartItemBody: validate(updateCartItemSchema),
};
