const Joi = require("joi");

const nameSchema = Joi.object({
	name: Joi.string().trim().required().messages({
		"string.empty": "Brand name is required",
		"any.required": "Brand name is required",
	}),
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
	validateBrandBody: validate(nameSchema),
};
