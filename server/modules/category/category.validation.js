const Joi = require("joi");

const nameSchema = Joi.object({
	name: Joi.string().trim().required().messages({
		"string.empty": "Category name is required",
		"any.required": "Category name is required",
	}),
	description: Joi.string().trim().allow("").optional(),
});

const validate = (schema) => (req, res, next) => {
	const { error } = schema.validate(req.body, { abortEarly: false });

	if (error) {
		return res.status(400).json({
			message: error.details.map((d) => d.message).join(", "),
		});
	}

	next();
};

module.exports = {
	validateCategoryBody: validate(nameSchema),
};
