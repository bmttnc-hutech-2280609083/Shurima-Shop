const authService = require('./auth.service');
const { registerSchema, loginSchema } = require('./auth.validation');

const register = async (req, res) => {
  try {
    // Validate input strictly
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null
      });
    }

    const user = await authService.register(value);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user
    });
  } catch (error) {
    return res.status(error.message === 'Email already exists' ? 409 : 500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

const login = async (req, res) => {
  try {
    // Validate input strictly
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null
      });
    }

    const { user, token } = await authService.login(value.email, value.password);

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: { user, token }
    });
  } catch (error) {
    return res.status(error.message === 'Invalid email or password' ? 401 : 500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

module.exports = {
  register,
  login
};
