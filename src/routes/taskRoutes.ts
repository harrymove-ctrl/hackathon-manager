import { Router } from 'express';
import { taskController } from '../controllers/taskController.js';

const router = Router();

router.get('/', taskController.getAll.bind(taskController));
router.get('/team/:memberId', taskController.getByAssignee.bind(taskController));
router.get('/:id', taskController.getById.bind(taskController));
router.post('/', taskController.create.bind(taskController));
router.put('/:id', taskController.update.bind(taskController));
router.delete('/:id', taskController.delete.bind(taskController));

export default router;
