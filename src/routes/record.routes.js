const express = require('express');
const { authenticate, requirePermission } = require('../middleware/auth.middleware');
const { recordValidators } = require('../middleware/validators');
const recordService = require('../services/record.service');

const router = express.Router();

// All record routes require authentication
router.use(authenticate);

// GET /api/records — viewer, analyst, admin
router.get(
  '/',
  requirePermission('read:records'),
  recordValidators.filters,
  async (req, res, next) => {
    try {
      const result = await recordService.getRecords(req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/records/:id — viewer, analyst, admin
router.get('/:id', requirePermission('read:records'), async (req, res, next) => {
  try {
    const record = await recordService.getRecordById(req.params.id);
    res.json({ record });
  } catch (err) {
    next(err);
  }
});

// POST /api/records — admin only
router.post(
  '/',
  requirePermission('create:records'),
  recordValidators.create,
  async (req, res, next) => {
    try {
      const record = await recordService.createRecord(req.body, req.user._id);
      res.status(201).json({ message: 'Record created', record });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/records/:id — admin only
router.put(
  '/:id',
  requirePermission('update:records'),
  recordValidators.update,
  async (req, res, next) => {
    try {
      const record = await recordService.updateRecord(req.params.id, req.body);
      res.json({ message: 'Record updated', record });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/records/:id — admin only (soft delete)
router.delete('/:id', requirePermission('delete:records'), async (req, res, next) => {
  try {
    await recordService.deleteRecord(req.params.id);
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
