const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const register = async ({ name, email, password, role }) => {
  const user = await User.create({ name, email, password, role });
  const token = signToken(user._id);
  return { user, token };
};

const login = async ({ email, password }) => {
  // Explicitly select password since it is excluded by default
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  if (!user.isActive) {
    const err = new Error('Account is inactive. Contact an administrator.');
    err.statusCode = 403;
    throw err;
  }

  const token = signToken(user._id);
  user.password = undefined; // strip password before returning
  return { user, token };
};

module.exports = { register, login };
