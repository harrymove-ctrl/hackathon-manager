import { Request, Response, NextFunction } from 'express';
import { teamMemberService, createTeamMemberSchema, updateTeamMemberSchema } from '../services/teamService.js';
import { ValidationError } from '../utils/errors.js';

export class TeamController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = req.query.projectId as string | undefined;
      const members = await teamMemberService.findAll(projectId);
      res.json(members);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const member = await teamMemberService.findById(req.params.id);
      res.json(member);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createTeamMemberSchema.parse(req.body);
      const member = await teamMemberService.create(data);
      res.status(201).json(member);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        next(new ValidationError('Invalid team member data', error));
      } else {
        next(error);
      }
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateTeamMemberSchema.parse(req.body);
      const member = await teamMemberService.update(req.params.id, data);
      res.json(member);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        next(new ValidationError('Invalid team member data', error));
      } else {
        next(error);
      }
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await teamMemberService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const teamController = new TeamController();
