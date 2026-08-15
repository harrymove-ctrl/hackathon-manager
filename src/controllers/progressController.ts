import { Request, Response, NextFunction } from 'express';
import { progressService } from '../services/progressService.js';

export class ProgressController {
  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await progressService.getSummary();
      res.json(summary);
    } catch (error) {
      next(error);
    }
  }

  async getTeamMemberProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const progress = await progressService.getTeamMemberProgress(req.params.memberId);
      res.json(progress);
    } catch (error) {
      next(error);
    }
  }
}

export const progressController = new ProgressController();
