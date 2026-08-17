import prisma from '../db/index.js';
import { NotFoundError } from '../utils/errors.js';
import { z } from 'zod';

export const createTeamMemberSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.string().default('member'),
  projectId: z.string().uuid().optional().nullable(),
});

export const updateTeamMemberSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  role: z.string().optional(),
  projectId: z.string().uuid().optional().nullable(),
});

export type CreateTeamMember = z.infer<typeof createTeamMemberSchema>;
export type UpdateTeamMember = z.infer<typeof updateTeamMemberSchema>;

export class TeamMemberService {
  async findAll(projectId?: string) {
    return prisma.teamMember.findMany({
      where: projectId ? { projectId } : undefined,
      include: {
        tasks: {
          select: {
            id: true,
            status: true,
            priority: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const member = await prisma.teamMember.findUnique({
      where: { id },
      include: {
        tasks: true,
      },
    });
    if (!member) throw new NotFoundError('Team member', id);
    return member;
  }

  async create(data: CreateTeamMember) {
    return prisma.teamMember.create({ data });
  }

  async update(id: string, data: UpdateTeamMember) {
    await this.findById(id);
    return prisma.teamMember.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findById(id);
    return prisma.teamMember.delete({ where: { id } });
  }
}

export const teamMemberService = new TeamMemberService();
