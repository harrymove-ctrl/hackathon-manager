import prisma from '../db/index.js';
import { Prisma } from '@prisma/client';

export class ProjectRepository {
  async findAll() {
    return prisma.project.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: string) {
    return prisma.project.findUnique({
      where: { id }
    });
  }

  async create(data: Prisma.ProjectCreateInput) {
    return prisma.project.create({
      data
    });
  }

  async update(id: string, data: Prisma.ProjectUpdateInput) {
    return prisma.project.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return prisma.project.delete({
      where: { id }
    });
  }
}
