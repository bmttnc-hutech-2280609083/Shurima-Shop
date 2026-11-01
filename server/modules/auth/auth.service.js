const User = require('../user/user.model');
const bcrypt = require('bcryptjs'); // Updated to use bcryptjs
const jwt = require('jsonwebtoken');

const register = async (userData) => {
  const { name, email, password } = userData;

  // Check duplicate email
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email already exists');
  }

  // Hash password using bcryptjs
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    role: 'user' // Default role
  });

  // Return user without password
  const result = newUser.toObject();
  delete result.password;
  
  return result;
};

const login = async (email, password) => {
  // Validate email & password
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Verify password using bcryptjs
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  // Include user id + role in token
  const payload = {
    id: user._id,
    role: user.role
  };

  // Generate JWT token using process.env.JWT_SECRET and expiring in 7 days
  const token = jwt.sign(
    payload, 
    process.env.JWT_SECRET || 'fallback_shurima_secret', 
    { expiresIn: '7d' }
  );

  // Return user without password
  const result = user.toObject();
  delete result.password;

  return { user: result, token };
};

module.exports = {
  register,
  login
};
