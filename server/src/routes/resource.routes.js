import { Router } from 'express';
import { body } from 'express-validator';
import {
  createResource,
  getResources,
  getResourceById,
  updateResource,
  deleteResource,
  getAnalytics,
} from '../controllers/resource.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Apply protect middleware to all routes below
router.use(protect);

router.get('/analytics', getAnalytics);

router.route('/')
  .get(getResources)
  .post(
    [
      body('building', 'Building is required').notEmpty(),
      body('department', 'Department is required').notEmpty(),
      body('electricity', 'Electricity must be a non-negative number').isFloat({ min: 0 }),
      body('water', 'Water must be a non-negative number').isFloat({ min: 0 }),
      body('waste', 'Waste must be a non-negative number').isFloat({ min: 0 }),
    ],
    createResource
  );

router.route('/:id')
  .get(getResourceById)
  .put(
    [
      body('electricity', 'Electricity must be a non-negative number').optional().isFloat({ min: 0 }),
      body('water', 'Water must be a non-negative number').optional().isFloat({ min: 0 }),
      body('waste', 'Waste must be a non-negative number').optional().isFloat({ min: 0 }),
    ],
    updateResource
  )
  .delete(deleteResource);

export default router;
