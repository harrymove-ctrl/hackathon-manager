import { Request, Response, NextFunction } from 'express';
import { resourceService, createResourceSchema, updateResourceSchema } from '../services/resourceService.js';
import { ValidationError } from '../utils/errors.js';

export class ResourceController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const resources = await resourceService.findAll();
      res.json(resources);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const resource = await resourceService.findById(req.params.id);
      res.json(resource);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createResourceSchema.parse(req.body);
      const resource = await resourceService.create(data);
      res.status(201).json(resource);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        next(new ValidationError('Invalid resource data', error));
      } else {
        next(error);
      }
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateResourceSchema.parse(req.body);
      const resource = await resourceService.update(req.params.id, data);
      res.json(resource);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        next(new ValidationError('Invalid resource data', error));
      } else {
        next(error);
      }
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await resourceService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const resourceController = new ResourceController();
