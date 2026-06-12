import { Router } from 'express';
import {
  generateReport,
  getAllReports,
  getReportById,
  downloadReport,
  deleteReport,
} from '../controllers/report.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// ── Public route ─────────────────────────────────────────────────────────────
// Download is public — the MongoDB ObjectId is the access control token.
// This lets the frontend trigger a fetch() blob download without needing
// to pass a JWT Authorization header in a window.open() call.
router.get('/:id/download', downloadReport);

// ── Protected routes ─────────────────────────────────────────────────────────
router.use(protect);

router.post('/generate', generateReport);
router.get('/', getAllReports);
router.get('/:id', getReportById);
router.delete('/:id', deleteReport);

export default router;

