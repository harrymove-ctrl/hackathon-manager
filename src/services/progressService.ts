import prisma from '../db/index.js';

export class ProgressService {
  async getSummary() {
    const [
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      upcomingDeadlines,
      overdueItems,
      totalResources,
      totalTeamMembers,
    ] = await Promise.all([
      prisma.task.count(),
      prisma.task.count({ where: { status: 'DONE' } }),
      prisma.task.count({ where: { status: 'TODO' } }),
      prisma.task.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.deadline.count({
        where: {
          dueDate: { gte: new Date() },
          status: { not: 'COMPLETED' },
        },
      }),
      prisma.deadline.count({
        where: {
          dueDate: { lt: new Date() },
          status: { not: 'COMPLETED' },
        },
      }),
      prisma.resource.count(),
      prisma.teamMember.count(),
    ]);

    const completionRate = totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

    return {
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        inProgress: inProgressTasks,
        completionRate,
      },
      deadlines: {
        upcoming: upcomingDeadlines,
        overdue: overdueItems,
      },
      resources: {
        total: totalResources,
      },
      team: {
        total: totalTeamMembers,
      },
    };
  }

  async getTeamMemberProgress(memberId: string) {
    const member = await prisma.teamMember.findUnique({
      where: { id: memberId },
      include: {
        tasks: {
          include: { deadline: true },
        },
      },
    });

    if (!member) {
      throw new Error('Team member not found');
    }

    const totalTasks = member.tasks.length;
    const completedTasks = member.tasks.filter(t => t.status === 'DONE').length;
    const inProgressTasks = member.tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const pendingTasks = member.tasks.filter(t => t.status === 'TODO').length;

    return {
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        inProgress: inProgressTasks,
        pending: pendingTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      upcomingDeadlines: member.tasks
        .filter(t => t.deadline && new Date(t.deadline.dueDate) >= new Date())
        .map(t => t.deadline)
        .sort((a, b) => new Date(a!.dueDate).getTime() - new Date(b!.dueDate).getTime()),
    };
  }
}

export const progressService = new ProgressService();
