import { Request, Response, NextFunction } from 'express';
import { taskService, createTaskSchema, updateTaskSchema } from '../services/taskService.js';
import { ValidationError } from '../utils/errors.js';

export class TaskController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const tasks = await taskService.findAll();
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  }

  async getByAssignee(req: Request, res: Response, next: NextFunction) {
    try {
      const tasks = await taskService.findByAssignee(req.params.memberId);
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.findById(req.params.id);
      res.json(task);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createTaskSchema.parse(req.body);
      const task = await taskService.create(data);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        next(new ValidationError('Invalid task data', error));
      } else {
        next(error);
      }
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateTaskSchema.parse(req.body);
      const task = await taskService.update(req.params.id, data);
      res.json(task);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        next(new ValidationError('Invalid task data', error));
      } else {
        next(error);
      }
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await taskService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const taskController = new TaskController();
