import prisma from '../db/index.js';
import { NotFoundError } from '../utils/errors.js';
import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  assigneeId: z.string().uuid().optional().nullable(),
  deadlineId: z.string().uuid().optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial();

export type CreateTask = z.infer<typeof createTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;

export class TaskService {
  async findAll() {
    return prisma.task.findMany({
      include: { assignee: true },
      orderBy: [
        { status: 'asc' },
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findByAssignee(memberId: string) {
    return prisma.task.findMany({
      where: { assigneeId: memberId },
      include: { assignee: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundError('Task', id);
    return task;
  }

  async create(data: CreateTask) {
    return prisma.task.create({
      data: {
        ...data,
        completedAt: data.status === 'DONE' ? new Date() : null,
      },
      include: { assignee: true },
    });
  }

  async update(id: string, data: UpdateTask) {
    await this.findById(id);
    return prisma.task.update({
      where: { id },
      data: {
        ...data,
        completedAt: data.status === 'DONE' ? new Date() : undefined,
      },
      include: { assignee: true },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    return prisma.task.delete({ where: { id } });
  }
}

export const taskService = new TaskService();
