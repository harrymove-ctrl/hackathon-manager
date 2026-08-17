import { ProjectRepository } from '../repositories/projectRepository.js';
import { Prisma } from '@prisma/client';

export class ProjectService {
  private repository: ProjectRepository;

  constructor() {
    this.repository = new ProjectRepository();
  }

  async getAll() {
    return this.repository.findAll();
  }

  async getById(id: string) {
    const project = await this.repository.findById(id);
    if (!project) throw new Error('Project not found');
    return project;
  }

  async create(data: Prisma.ProjectCreateInput) {
    return this.repository.create(data);
  }

  async update(id: string, data: Prisma.ProjectUpdateInput) {
    await this.getById(id);
    return this.repository.update(id, data);
  }

  async delete(id: string) {
    await this.getById(id);
    return this.repository.delete(id);
  }
}

export const projectService = new ProjectService();
