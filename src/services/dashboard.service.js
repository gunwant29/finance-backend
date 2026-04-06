const Record = require('../models/record.model');

/**
 * Returns top-level summary: total income, total expenses, net balance.
 */
const getSummary = async () => {
  const result = await Record.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
      },
    },
  ]);

  const summary = { totalIncome: 0, totalExpenses: 0, netBalance: 0 };

  result.forEach(({ _id, total }) => {
    if (_id === 'income') summary.totalIncome = total;
    if (_id === 'expense') summary.totalExpenses = total;
  });

  summary.netBalance = summary.totalIncome - summary.totalExpenses;
  return summary;
};

/**
 * Returns per-category totals split by type.
 */
const getCategoryTotals = async () => {
  return Record.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: { category: '$category', type: '$type' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
    {
      $project: {
        _id: 0,
        category: '$_id.category',
        type: '$_id.type',
        total: 1,
        count: 1,
      },
    },
  ]);
};

/**
 * Returns monthly income/expense totals for the past N months.
 */
const getMonthlyTrends = async (months = 6) => {
  const since = new Date();
  since.setMonth(since.getMonth() - months);

  return Record.aggregate([
    { $match: { isDeleted: false, date: { $gte: since } } },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        type: '$_id.type',
        total: 1,
        count: 1,
      },
    },
  ]);
};

/**
 * Returns the N most recent non-deleted records.
 */
const getRecentActivity = async (limit = 10) => {
  return Record.find()
    .populate('createdBy', 'name')
    .sort({ date: -1 })
    .limit(limit);
};

/**
 * Returns weekly totals for the past N weeks.
 */
const getWeeklyTrends = async (weeks = 4) => {
  const since = new Date();
  since.setDate(since.getDate() - weeks * 7);

  return Record.aggregate([
    { $match: { isDeleted: false, date: { $gte: since } } },
    {
      $group: {
        _id: {
          week: { $week: '$date' },
          year: { $year: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.week': 1 } },
    {
      $project: {
        _id: 0,
        week: '$_id.week',
        year: '$_id.year',
        type: '$_id.type',
        total: 1,
        count: 1,
      },
    },
  ]);
};

module.exports = { getSummary, getCategoryTotals, getMonthlyTrends, getRecentActivity, getWeeklyTrends };
