const Joi = require("joi");

const objectIdRule = Joi.string().trim().length(24).hex();

const createCartSchema = Joi.object({
	user: objectIdRule.messages({
		"string.length": "User must be a valid id",
		"string.hex": "User must be a valid id",
	}),
	status: Joi.string().valid("active", "checked_out", "abandoned").default("active"),
});

const updateCartSchema = Joi.object({
	user: objectIdRule.messages({
		"string.length": "User must be a valid id",
		"string.hex": "User must be a valid id",
	}),
	status: Joi.string().valid("active", "checked_out", "abandoned"),
})
	.min(1)
	.messages({
		"object.min": "At least one field is required to update cart",
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
	validateCreateCartBody: validate(createCartSchema),
	validateUpdateCartBody: validate(updateCartSchema),
};
