import { Router } from 'express';
import { teamController } from '../controllers/teamController.js';

const router = Router();

router.get('/', teamController.getAll.bind(teamController));
router.get('/:id', teamController.getById.bind(teamController));
router.post('/', teamController.create.bind(teamController));
router.put('/:id', teamController.update.bind(teamController));
router.delete('/:id', teamController.delete.bind(teamController));

export default router;
