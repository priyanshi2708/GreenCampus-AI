import { Router } from 'express';
import { resetDemoData, seedDemoData } from '../controllers/admin.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.delete('/reset-demo-data', resetDemoData);
router.post('/seed-demo-data', seedDemoData);

export default router;
