import { Request, Response, NextFunction } from 'express';
import { deadlineService, createDeadlineSchema, updateDeadlineSchema } from '../services/deadlineService.js';
import { ValidationError } from '../utils/errors.js';

export class DeadlineController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const deadlines = await deadlineService.findAll();
      res.json(deadlines);
    } catch (error) {
      next(error);
    }
  }

  async getUpcoming(req: Request, res: Response, next: NextFunction) {
    try {
      const deadlines = await deadlineService.findUpcoming();
      res.json(deadlines);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const deadline = await deadlineService.findById(req.params.id);
      res.json(deadline);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createDeadlineSchema.parse(req.body);
      const deadline = await deadlineService.create(data);
      res.status(201).json(deadline);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        next(new ValidationError('Invalid deadline data', error));
      } else {
        next(error);
      }
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateDeadlineSchema.parse(req.body);
      const deadline = await deadlineService.update(req.params.id, data);
      res.json(deadline);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        next(new ValidationError('Invalid deadline data', error));
      } else {
        next(error);
      }
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await deadlineService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const deadlineController = new DeadlineController();
