const express = require('express');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { userValidators } = require('../middleware/validators');
const userService = require('../services/user.service');

const router = express.Router();

// All user management routes require authentication and admin role
router.use(authenticate, authorize('admin'));

// GET /api/users
router.get('/', async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id
router.get('/:id', async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/:id/role
router.patch('/:id/role', userValidators.updateRole, async (req, res, next) => {
  try {
    const user = await userService.updateUserRole(req.params.id, req.body.role);
    res.json({ message: 'Role updated successfully', user });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/:id/status
router.patch('/:id/status', userValidators.updateStatus, async (req, res, next) => {
  try {
    const user = await userService.updateUserStatus(req.params.id, req.body.isActive);
    res.json({ message: 'User status updated', user });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id, req.user._id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
