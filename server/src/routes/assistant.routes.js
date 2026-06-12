import { Router } from 'express';
import { chatWithAssistant, getHistory, deleteHistory } from '../controllers/assistant.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Apply protect middleware to guarantee user is authenticated
router.use(protect);

router.post('/chat', chatWithAssistant);
router.get('/history', getHistory);
router.delete('/history', deleteHistory);

export default router;
