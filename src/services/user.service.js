const User = require('../models/user.model');

const getAllUsers = async () => {
  return User.find().sort({ createdAt: -1 });
};

const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

const updateUserRole = async (id, role) => {
  const user = await User.findByIdAndUpdate(id, { role }, { new: true, runValidators: true });
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

const updateUserStatus = async (id, isActive) => {
  const user = await User.findByIdAndUpdate(id, { isActive }, { new: true });
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

const deleteUser = async (id, requesterId) => {
  if (id === requesterId.toString()) {
    const err = new Error('You cannot delete your own account');
    err.statusCode = 400;
    throw err;
  }
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
};

module.exports = { getAllUsers, getUserById, updateUserRole, updateUserStatus, deleteUser };
