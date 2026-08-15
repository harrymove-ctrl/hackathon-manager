import { Router } from 'express';
import { progressController } from '../controllers/progressController.js';

const router = Router();

router.get('/summary', progressController.getSummary.bind(progressController));
router.get('/team/:memberId', progressController.getTeamMemberProgress.bind(progressController));

export default router;
