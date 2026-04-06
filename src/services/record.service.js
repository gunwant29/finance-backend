const Record = require('../models/record.model');

/**
 * Build a MongoDB query filter from request query params.
 */
const buildFilter = ({ type, category, startDate, endDate }) => {
  const filter = {};
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  return filter;
};

const getRecords = async (queryParams) => {
  const { page = 1, limit = 20, sortBy = 'date', order = 'desc', ...rest } = queryParams;
  const filter = buildFilter(rest);
  const skip = (Number(page) - 1) * Number(limit);
  const sortOrder = order === 'asc' ? 1 : -1;

  const [records, total] = await Promise.all([
    Record.find(filter)
      .populate('createdBy', 'name email')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(Number(limit)),
    Record.countDocuments(filter),
  ]);

  return {
    records,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

const getRecordById = async (id) => {
  const record = await Record.findById(id).populate('createdBy', 'name email');
  if (!record) {
    const err = new Error('Record not found');
    err.statusCode = 404;
    throw err;
  }
  return record;
};

const createRecord = async (data, userId) => {
  return Record.create({ ...data, createdBy: userId });
};

const updateRecord = async (id, data) => {
  const record = await Record.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!record) {
    const err = new Error('Record not found');
    err.statusCode = 404;
    throw err;
  }
  return record;
};

const deleteRecord = async (id) => {
  // Soft delete — marks the record as deleted instead of removing it
  const record = await Record.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  if (!record) {
    const err = new Error('Record not found');
    err.statusCode = 404;
    throw err;
  }
};

module.exports = { getRecords, getRecordById, createRecord, updateRecord, deleteRecord };
