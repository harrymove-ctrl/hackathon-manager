import { Router } from 'express';
import { deadlineController } from '../controllers/deadlineController.js';

const router = Router();

router.get('/', deadlineController.getAll.bind(deadlineController));
router.get('/upcoming', deadlineController.getUpcoming.bind(deadlineController));
router.get('/:id', deadlineController.getById.bind(deadlineController));
router.post('/', deadlineController.create.bind(deadlineController));
router.put('/:id', deadlineController.update.bind(deadlineController));
router.delete('/:id', deadlineController.delete.bind(deadlineController));

export default router;
