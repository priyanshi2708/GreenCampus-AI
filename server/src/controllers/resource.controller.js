import { Resource } from '../models/Resource.js';
import { validationResult } from 'express-validator';

// ── Helpers ─────────────────────────────────────────────────────────────────
const parseIntSafe = (v, fallback) => {
  const n = parseInt(v, 10);
  return isNaN(n) ? fallback : n;
};

/**
 * @desc    Create a new resource entry
 * @route   POST /api/resources
 * @access  Private
 */
export const createResource = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ success: false, errors: errors.array() });

    const { building, department, electricity, water, waste, date, notes } = req.body;

    const resource = await Resource.create({
      building,
      department,
      electricity: parseFloat(electricity),
      water:       parseFloat(water),
      waste:       parseFloat(waste),
      date:        date ? new Date(date) : new Date(),
      notes,
      enteredBy:   req.user?._id,
    });

    res.status(201).json({ success: true, data: resource });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all resource entries (with filtering, sorting, pagination)
 * @route   GET /api/resources
 * @access  Private
 */
export const getResources = async (req, res, next) => {
  try {
    const {
      building,
      department,
      month,
      year,
      dateFrom,
      dateTo,
      sortBy   = 'date',
      sortDir  = 'desc',
      page     = 1,
      limit    = 25,
      search,
    } = req.query;

    // Build filter
    const filter = {};

    if (building)    filter.building    = { $regex: building, $options: 'i' };
    if (department)  filter.department  = { $regex: department, $options: 'i' };
    if (search)      filter.$or = [
      { building:   { $regex: search, $options: 'i' } },
      { department: { $regex: search, $options: 'i' } },
    ];

    // Date range
    if (dateFrom || dateTo || month || year) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo)   filter.date.$lte = new Date(new Date(dateTo).setHours(23, 59, 59, 999));

      if (year && !dateFrom && !dateTo) {
        const y = parseInt(year, 10);
        filter.date.$gte = new Date(y, month ? parseInt(month, 10) - 1 : 0, 1);
        filter.date.$lte = month
          ? new Date(y, parseInt(month, 10), 0, 23, 59, 59)
          : new Date(y, 12, 0, 23, 59, 59);
      }
    }

    // Sorting
    const allowedSortFields = ['date', 'electricity', 'water', 'waste', 'carbon', 'building', 'department'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'date';
    const sort = { [sortField]: sortDir === 'asc' ? 1 : -1 };

    // Pagination
    const pageNum   = parseIntSafe(page, 1);
    const limitNum  = Math.min(parseIntSafe(limit, 25), 200);
    const skip      = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      Resource.find(filter).sort(sort).skip(skip).limit(limitNum).lean(),
      Resource.countDocuments(filter),
    ]);

    // Aggregated summary
    const summary = await Resource.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalElectricity: { $sum: '$electricity' },
          totalWater:       { $sum: '$water' },
          totalWaste:       { $sum: '$waste' },
          totalCarbon:      { $sum: '$carbon' },
          avgElectricity:   { $avg: '$electricity' },
          avgWater:         { $avg: '$water' },
          avgWaste:         { $avg: '$waste' },
          avgCarbon:        { $avg: '$carbon' },
        },
      },
    ]);

    res.json({
      success: true,
      data,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
      summary: summary[0] ?? null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get a single resource entry by ID
 * @route   GET /api/resources/:id
 * @access  Private
 */
export const getResourceById = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id).lean();
    if (!resource)
      return res.status(404).json({ success: false, message: 'Resource entry not found.' });

    res.json({ success: true, data: resource });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update a resource entry
 * @route   PUT /api/resources/:id
 * @access  Private
 */
export const updateResource = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ success: false, errors: errors.array() });

    const { building, department, electricity, water, waste, date, notes } = req.body;

    const update = {};
    if (building    !== undefined) update.building    = building;
    if (department  !== undefined) update.department  = department;
    if (electricity !== undefined) update.electricity = parseFloat(electricity);
    if (water       !== undefined) update.water       = parseFloat(water);
    if (waste       !== undefined) update.waste       = parseFloat(waste);
    if (date        !== undefined) update.date        = new Date(date);
    if (notes       !== undefined) update.notes       = notes;

    // Carbon will be recalculated via the pre-hook (findOneAndUpdate)
    if (update.electricity !== undefined || update.waste !== undefined) {
      // Fetch current to fill missing fields for carbon calc
      const existing = await Resource.findById(req.params.id).select('electricity waste').lean();
      if (!existing) return res.status(404).json({ success: false, message: 'Resource entry not found.' });
      const elec  = update.electricity ?? existing.electricity;
      const waste2 = update.waste      ?? existing.waste;
      update.carbon = parseFloat((elec * 0.233 + waste2 * 0.054).toFixed(4));
    }

    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true },
    ).lean();

    if (!resource)
      return res.status(404).json({ success: false, message: 'Resource entry not found.' });

    res.json({ success: true, data: resource });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete a resource entry
 * @route   DELETE /api/resources/:id
 * @access  Private
 */
export const deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id).lean();
    if (!resource)
      return res.status(404).json({ success: false, message: 'Resource entry not found.' });

    res.json({ success: true, message: 'Resource entry deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get analytics aggregation by building / department / trend
 * @route   GET /api/resources/analytics
 * @access  Private
 */
export const getAnalytics = async (req, res, next) => {
  try {
    const { groupBy = 'building', days = 30 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - parseInt(days, 10));

    const groupField = ['building', 'department'].includes(groupBy) ? groupBy : 'building';

    const [byGroup, trend] = await Promise.all([
      // Grouped totals
      Resource.aggregate([
        { $match: { date: { $gte: since } } },
        {
          $group: {
            _id:              `$${groupField}`,
            totalElectricity: { $sum: '$electricity' },
            totalWater:       { $sum: '$water' },
            totalWaste:       { $sum: '$waste' },
            totalCarbon:      { $sum: '$carbon' },
            count:            { $sum: 1 },
          },
        },
        { $sort: { totalElectricity: -1 } },
      ]),
      // Daily trend
      Resource.aggregate([
        { $match: { date: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            electricity: { $sum: '$electricity' },
            water:       { $sum: '$water' },
            waste:       { $sum: '$waste' },
            carbon:      { $sum: '$carbon' },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { date: '$_id', electricity: 1, water: 1, waste: 1, carbon: 1, _id: 0 } },
      ]),
    ]);

    res.json({ success: true, data: { byGroup, trend } });
  } catch (err) {
    next(err);
  }
};
