import { Router } from 'express';
import {
  getAlerts,
  createAlert,
  updateAlert,
  deleteAlert
} from '../controllers/alert.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', getAlerts);
router.post('/', createAlert);
router.put('/:id', updateAlert);
router.delete('/:id', deleteAlert);

export default router;
