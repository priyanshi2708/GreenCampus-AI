import { Router } from 'express';
import {
  generatePredictions,
  getPredictions,
  getPredictionByResource,
} from '../controllers/prediction.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Apply protect authentication check to all forecast endpoints
router.use(protect);

router.post('/generate', generatePredictions);
router.get('/', getPredictions);
router.get('/electricity', getPredictionByResource('electricity'));
router.get('/water', getPredictionByResource('water'));
router.get('/waste', getPredictionByResource('waste'));
router.get('/carbon', getPredictionByResource('carbon'));

export default router;
