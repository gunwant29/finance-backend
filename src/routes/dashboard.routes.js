const express = require('express');
const { authenticate, requirePermission } = require('../middleware/auth.middleware');
const dashboardService = require('../services/dashboard.service');

const router = express.Router();

router.use(authenticate, requirePermission('read:dashboard'));

// GET /api/dashboard/summary — total income, expenses, net balance
router.get('/summary', async (req, res, next) => {
  try {
    const data = await dashboardService.getSummary();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/categories — category-wise totals
router.get('/categories', async (req, res, next) => {
  try {
    const data = await dashboardService.getCategoryTotals();
    res.json({ categories: data });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/trends/monthly?months=6
router.get('/trends/monthly', async (req, res, next) => {
  try {
    const months = parseInt(req.query.months) || 6;
    const data = await dashboardService.getMonthlyTrends(months);
    res.json({ trends: data });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/trends/weekly?weeks=4
router.get('/trends/weekly', async (req, res, next) => {
  try {
    const weeks = parseInt(req.query.weeks) || 4;
    const data = await dashboardService.getWeeklyTrends(weeks);
    res.json({ trends: data });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/recent?limit=10
router.get('/recent', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data = await dashboardService.getRecentActivity(limit);
    res.json({ recentActivity: data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
