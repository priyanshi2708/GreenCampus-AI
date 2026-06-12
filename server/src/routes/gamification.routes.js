import { Router } from 'express';
import {
  getLeaderboard,
  getChallenges,
  createChallenge,
  joinChallenge,
  getBadges
} from '../controllers/gamification.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/leaderboard', getLeaderboard);
router.get('/challenges', getChallenges);
router.post('/challenges', createChallenge);
router.post('/challenges/:id/join', joinChallenge);
router.get('/badges', getBadges);

export default router;
