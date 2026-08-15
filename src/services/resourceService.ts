import prisma from '../db/index.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { z } from 'zod';

export const createResourceSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  type: z.enum(['DOCUMENT', 'LINK', 'FILE', 'NOTE']),
  url: z.string().url().optional().nullable(),
  content: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  createdBy: z.string().min(1),
});

export const updateResourceSchema = createResourceSchema.partial();

export type CreateResource = z.infer<typeof createResourceSchema>;
export type UpdateResource = z.infer<typeof updateResourceSchema>;

export class ResourceService {
  async findAll() {
    return prisma.resource.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const resource = await prisma.resource.findUnique({ where: { id } });
    if (!resource) throw new NotFoundError('Resource', id);
    return resource;
  }

  async create(data: CreateResource) {
    return prisma.resource.create({ data });
  }

  async update(id: string, data: UpdateResource) {
    await this.findById(id);
    return prisma.resource.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findById(id);
    return prisma.resource.delete({ where: { id } });
  }
}

export const resourceService = new ResourceService();
