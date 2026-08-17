import prisma from '../db/index.js';
import { NotFoundError } from '../utils/errors.js';
import { z } from 'zod';

export const createDeadlineSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  dueDate: z.string().datetime().transform(s => new Date(s)),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  assignedTo: z.string().optional().nullable(),
  projectId: z.string().uuid().optional().nullable(),
});

export const updateDeadlineSchema = createDeadlineSchema.partial();

export type CreateDeadline = z.infer<typeof createDeadlineSchema>;
export type UpdateDeadline = z.infer<typeof updateDeadlineSchema>;

export class DeadlineService {
  async findAll(projectId?: string) {
    return prisma.deadline.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { dueDate: 'asc' },
    });
  }

  async findUpcoming() {
    const now = new Date();
    return prisma.deadline.findMany({
      where: {
        dueDate: { gte: now },
        status: { not: 'COMPLETED' },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
    });
  }

  async findById(id: string) {
    const deadline = await prisma.deadline.findUnique({ where: { id } });
    if (!deadline) throw new NotFoundError('Deadline', id);
    return deadline;
  }

  async create(data: CreateDeadline) {
    return prisma.deadline.create({ data });
  }

  async update(id: string, data: UpdateDeadline) {
    await this.findById(id);
    return prisma.deadline.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findById(id);
    return prisma.deadline.delete({ where: { id } });
  }
}

export const deadlineService = new DeadlineService();
