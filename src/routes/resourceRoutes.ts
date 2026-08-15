import { Router } from 'express';
import { resourceController } from '../controllers/resourceController.js';

const router = Router();

router.get('/', resourceController.getAll.bind(resourceController));
router.get('/:id', resourceController.getById.bind(resourceController));
router.post('/', resourceController.create.bind(resourceController));
router.put('/:id', resourceController.update.bind(resourceController));
router.delete('/:id', resourceController.delete.bind(resourceController));

export default router;
