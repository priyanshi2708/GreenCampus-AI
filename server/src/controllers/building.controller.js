import { Building } from '../models/Building.js';

/**
 * @desc    Get all buildings
 * @route   GET /api/buildings
 */
export const getBuildings = async (req, res, next) => {
  try {
    const buildings = await Building.find({ isActive: true }).sort({ name: 1 }).lean();
    res.json({ success: true, data: buildings });
  } catch (err) { next(err); }
};

/**
 * @desc    Create building
 * @route   POST /api/buildings
 */
export const createBuilding = async (req, res, next) => {
  try {
    const building = await Building.create({ ...req.body, createdBy: req.user?._id });
    res.status(201).json({ success: true, data: building });
  } catch (err) { next(err); }
};

/**
 * @desc    Update building
 * @route   PUT /api/buildings/:id
 */
export const updateBuilding = async (req, res, next) => {
  try {
    const building = await Building.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).lean();
    if (!building) return res.status(404).json({ success: false, message: 'Building not found.' });
    res.json({ success: true, data: building });
  } catch (err) { next(err); }
};

/**
 * @desc    Delete building (soft delete)
 * @route   DELETE /api/buildings/:id
 */
export const deleteBuilding = async (req, res, next) => {
  try {
    const building = await Building.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).lean();
    if (!building) return res.status(404).json({ success: false, message: 'Building not found.' });
    res.json({ success: true, message: 'Building deactivated.' });
  } catch (err) { next(err); }
};
