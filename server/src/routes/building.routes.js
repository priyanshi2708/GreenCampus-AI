import { Router } from 'express';
import { getBuildings, createBuilding, updateBuilding, deleteBuilding } from '../controllers/building.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.route('/')
  .get(getBuildings)
  .post(authorize('admin'), createBuilding);

router.route('/:id')
  .put(authorize('admin'), updateBuilding)
  .delete(authorize('admin'), deleteBuilding);

export default router;
