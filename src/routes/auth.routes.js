const express = require('express');
const { register, login } = require('../services/auth.service');
const { authValidators } = require('../middleware/validators');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// POST /api/auth/register
router.post('/register', authValidators.register, async (req, res, next) => {
  try {
    const { user, token } = await register(req.body);
    res.status(201).json({ message: 'User registered successfully', token, user });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', authValidators.login, async (req, res, next) => {
  try {
    const { user, token } = await login(req.body);
    res.json({ message: 'Login successful', token, user });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me  — returns the currently authenticated user
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
