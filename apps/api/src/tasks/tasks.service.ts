import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

type TaskStatus =
  | 'TODO'
  | 'IN_PROGRESS'
  | 'DONE';

type TaskPriority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'URGENT';

type CreateTaskInput = {
  title: string;
  description?: string;

  status?: TaskStatus;
  priority?: TaskPriority;

  dueDate?: string | null;
  assigneeIds?: string[];

  startupId?: string | null;
  residentId?: string | null;
  infrastructureId?: string | null;
};

type UpdateTaskInput =
  Partial<CreateTaskInput>;

const userSelect = {
  id: true,
  name: true,
  email: true,
  position: true,
};

const listInclude = {
  creator: {
    select: userSelect,
  },

  assignees: {
    include: {
      user: {
        select: userSelect,
      },
    },

    orderBy: {
      assignedAt: 'asc' as const,
    },
  },

  startup: {
    select: {
      id: true,
      name: true,
    },
  },

  resident: {
    select: {
      id: true,
      companyName: true,
    },
  },

  infrastructure: {
    select: {
      id: true,
      name: true,
    },
  },

  _count: {
    select: {
      comments: true,
      attachments: true,
    },
  },
};

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll() {
    const tasks =
      await this.prisma.task.findMany({
        include: listInclude,

        orderBy: {
          createdAt: 'desc',
        },
      });

    return tasks.map(
      (task) =>
        this.normalizeTask(
          task,
        ),
    );
  }

  async findMyTasks(
    userId: string,
  ) {
    const tasks =
      await this.prisma.task.findMany({
        where: {
          assignees: {
            some: {
              userId,
            },
          },
        },

        include: listInclude,

        orderBy: [
          {
            status: 'asc',
          },
          {
            dueDate: 'asc',
          },
          {
            createdAt: 'desc',
          },
        ],
      });

    return tasks.map(
      (task) =>
        this.normalizeTask(
          task,
        ),
    );
  }

  async findOne(
    id: string,
  ) {
    const task =
      await this.prisma.task.findUnique({
        where: {
          id,
        },

        include: {
          creator: {
            select: userSelect,
          },

          assignees: {
            include: {
              user: {
                select: userSelect,
              },
            },

            orderBy: {
              assignedAt: 'asc',
            },
          },

          startup: true,
          resident: true,
          infrastructure: true,

          comments: {
            include: {
              user: {
                select: userSelect,
              },
            },

            orderBy: {
              createdAt: 'asc',
            },
          },

          attachments: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });

    if (!task) {
      throw new NotFoundException(
        'Task not found',
      );
    }

    const activities =
      await this.prisma.activityLog.findMany({
        where: {
          entityType: 'TASK',
          entityId: id,
        },

        include: {
          user: {
            select: userSelect,
          },
        },

        orderBy: {
          createdAt: 'desc',
        },
      });

    return {
      ...this.normalizeTask(
        task,
      ),
      activities,
    };
  }

  async create(
    creatorId: string,
    data: CreateTaskInput,
  ) {
    if (!data.title?.trim()) {
      throw new BadRequestException(
        'Task title is required',
      );
    }

    const assigneeIds =
      this.uniqueIds(
        data.assigneeIds,
      );

    await this.validateAssignees(
      assigneeIds,
    );

    const status =
      data.status ?? 'TODO';

    const task =
      await this.prisma.task.create({
        data: {
          title:
            data.title.trim(),

          description:
            data.description?.trim() ||
            null,

          status,

          priority:
            data.priority ??
            'MEDIUM',

          dueDate:
            data.dueDate
              ? new Date(
                  data.dueDate,
                )
              : null,

          completedAt:
            status === 'DONE'
              ? new Date()
              : null,

          creatorId,

          assignees:
            assigneeIds.length > 0
              ? {
                  create:
                    assigneeIds.map(
                      (userId) => ({
                        userId,
                      }),
                    ),
                }
              : undefined,

          startupId:
            data.startupId ||
            null,

          residentId:
            data.residentId ||
            null,

          infrastructureId:
            data.infrastructureId ||
            null,
        },

        include: listInclude,
      });

    await this.createActivity({
      userId: creatorId,
      taskId: task.id,
      action: 'TASK_CREATED',
      description:
        'created this task',
    });

    return this.normalizeTask(
      task,
    );
  }

  async update(
    id: string,
    userId: string,
    data: UpdateTaskInput,
  ) {
    const existing =
      await this.prisma.task.findUnique({
        where: {
          id,
        },

        include: {
          assignees: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

    if (!existing) {
      throw new NotFoundException(
        'Task not found',
      );
    }

    if (
      data.title !== undefined &&
      !data.title.trim()
    ) {
      throw new BadRequestException(
        'Task title is required',
      );
    }

    const nextAssigneeIds =
      data.assigneeIds !==
      undefined
        ? this.uniqueIds(
            data.assigneeIds,
          )
        : undefined;

    if (
      nextAssigneeIds !==
      undefined
    ) {
      await this.validateAssignees(
        nextAssigneeIds,
      );
    }

    const nextStatus =
      data.status ??
      existing.status;

    const updated =
      await this.prisma.task.update({
        where: {
          id,
        },

        data: {
          ...(data.title !==
            undefined && {
            title:
              data.title.trim(),
          }),

          ...(data.description !==
            undefined && {
            description:
              data.description?.trim() ||
              null,
          }),

          ...(data.priority !==
            undefined && {
            priority:
              data.priority,
          }),

          ...(data.status !==
            undefined && {
            status:
              data.status,

            completedAt:
              nextStatus ===
              'DONE'
                ? existing.completedAt ??
                  new Date()
                : null,
          }),

          ...(data.dueDate !==
            undefined && {
            dueDate:
              data.dueDate
                ? new Date(
                    data.dueDate,
                  )
                : null,
          }),

          ...(nextAssigneeIds !==
            undefined && {
            assignees: {
              deleteMany: {},
              create:
                nextAssigneeIds.map(
                  (assigneeId) => ({
                    userId:
                      assigneeId,
                  }),
                ),
            },
          }),

          ...(data.startupId !==
            undefined && {
            startupId:
              data.startupId ||
              null,
          }),

          ...(data.residentId !==
            undefined && {
            residentId:
              data.residentId ||
              null,
          }),

          ...(data.infrastructureId !==
            undefined && {
            infrastructureId:
              data.infrastructureId ||
              null,
          }),
        },

        include: listInclude,
      });

    const activities: {
      action: string;
      description: string;
    }[] = [];

    if (
      data.status !== undefined &&
      data.status !==
        existing.status
    ) {
      activities.push({
        action:
          'STATUS_CHANGED',

        description:
          `moved this task from ${this.statusLabel(
            existing.status,
          )} to ${this.statusLabel(
            data.status,
          )}`,
      });
    }

    if (
      nextAssigneeIds !==
      undefined
    ) {
      const previousIds =
        existing.assignees
          .map(
            (item) =>
              item.userId,
          )
          .sort();

      const nextIds = [
        ...nextAssigneeIds,
      ].sort();

      if (
        previousIds.join(',') !==
        nextIds.join(',')
      ) {
        const previousNames =
          existing.assignees
            .map(
              (item) =>
                item.user.name,
            )
            .join(', ') ||
          'Unassigned';

        const nextNames =
          updated.assignees
            .map(
              (item) =>
                item.user.name,
            )
            .join(', ') ||
          'Unassigned';

        activities.push({
          action:
            'ASSIGNEES_CHANGED',

          description:
            `changed assignees from ${previousNames} to ${nextNames}`,
        });
      }
    }

    if (
      data.priority !==
        undefined &&
      data.priority !==
        existing.priority
    ) {
      activities.push({
        action:
          'PRIORITY_CHANGED',

        description:
          `changed priority from ${this.priorityLabel(
            existing.priority,
          )} to ${this.priorityLabel(
            data.priority,
          )}`,
      });
    }

    if (
      data.dueDate !==
      undefined
    ) {
      const oldDate =
        existing.dueDate
          ? this.dateKey(
              existing.dueDate,
            )
          : null;

      const newDate =
        data.dueDate || null;

      if (
        oldDate !== newDate
      ) {
        if (newDate) {
          activities.push({
            action:
              'DUE_DATE_CHANGED',

            description:
              `changed the due date to ${this.formatDate(
                new Date(
                  newDate,
                ),
              )}`,
          });
        } else {
          activities.push({
            action:
              'DUE_DATE_REMOVED',

            description:
              'removed the due date',
          });
        }
      }
    }

    if (
      data.title !==
        undefined &&
      data.title.trim() !==
        existing.title
    ) {
      activities.push({
        action:
          'TITLE_CHANGED',

        description:
          'changed the task title',
      });
    }

    if (
      data.description !==
        undefined &&
      (data.description?.trim() ||
        null) !==
        existing.description
    ) {
      activities.push({
        action:
          'DESCRIPTION_CHANGED',

        description:
          'updated the task description',
      });
    }

    if (
      activities.length > 0
    ) {
      await this.prisma.activityLog.createMany({
        data: activities.map(
          (activity) => ({
            userId,
            entityType: 'TASK',
            entityId: id,
            action:
              activity.action,
            description:
              activity.description,
          }),
        ),
      });
    }

    return this.normalizeTask(
      updated,
    );
  }

  async addComment(
    taskId: string,
    userId: string,
    content: string,
  ) {
    const text =
      content?.trim();

    if (!text) {
      throw new BadRequestException(
        'Comment cannot be empty',
      );
    }

    const task =
      await this.prisma.task.findUnique({
        where: {
          id: taskId,
        },

        select: {
          id: true,
        },
      });

    if (!task) {
      throw new NotFoundException(
        'Task not found',
      );
    }

    const comment =
      await this.prisma.taskComment.create({
        data: {
          taskId,
          userId,
          content: text,
        },

        include: {
          user: {
            select: userSelect,
          },
        },
      });

    await this.createActivity({
      userId,
      taskId,
      action:
        'COMMENT_ADDED',
      description:
        'added a comment',
    });

    return comment;
  }

  async removeComment(
    taskId: string,
    commentId: string,
    userId: string,
  ) {
    const comment =
      await this.prisma.taskComment.findUnique({
        where: {
          id: commentId,
        },
      });

    if (
      !comment ||
      comment.taskId !==
        taskId
    ) {
      throw new NotFoundException(
        'Comment not found',
      );
    }

    if (
      comment.userId !==
      userId
    ) {
      throw new BadRequestException(
        'You can only delete your own comment',
      );
    }

    await this.prisma.taskComment.delete({
      where: {
        id: commentId,
      },
    });

    return {
      success: true,
    };
  }

  async remove(
    id: string,
  ) {
    const task =
      await this.prisma.task.findUnique({
        where: {
          id,
        },
      });

    if (!task) {
      throw new NotFoundException(
        'Task not found',
      );
    }

    await this.prisma.$transaction([
      this.prisma.activityLog.deleteMany({
        where: {
          entityType: 'TASK',
          entityId: id,
        },
      }),

      this.prisma.task.delete({
        where: {
          id,
        },
      }),
    ]);

    return {
      success: true,
    };
  }

  private normalizeTask(
    task: any,
  ) {
    const {
      assignees,
      ...rest
    } = task;

    return {
      ...rest,
      assignees:
        Array.isArray(
          assignees,
        )
          ? assignees.map(
              (item: any) =>
                item.user,
            )
          : [],
    };
  }

  private uniqueIds(
    ids?: string[],
  ) {
    return [
      ...new Set(
        (ids || [])
          .map(
            (id) =>
              id?.trim(),
          )
          .filter(
            Boolean,
          ) as string[],
      ),
    ];
  }

  private async validateAssignees(
    assigneeIds: string[],
  ) {
    if (
      assigneeIds.length === 0
    ) {
      return;
    }

    const users =
      await this.prisma.user.findMany({
        where: {
          id: {
            in: assigneeIds,
          },

          isActive: true,
        },

        select: {
          id: true,
        },
      });

    if (
      users.length !==
      assigneeIds.length
    ) {
      throw new BadRequestException(
        'One or more selected users are not available',
      );
    }
  }

  private async createActivity({
    userId,
    taskId,
    action,
    description,
  }: {
    userId: string;
    taskId: string;
    action: string;
    description: string;
  }) {
    return this.prisma.activityLog.create({
      data: {
        userId,
        entityType: 'TASK',
        entityId: taskId,
        action,
        description,
      },
    });
  }

  private statusLabel(
    status: string,
  ) {
    if (status === 'TODO') {
      return 'To do';
    }

    if (
      status ===
      'IN_PROGRESS'
    ) {
      return 'In progress';
    }

    if (
      status === 'DONE'
    ) {
      return 'Done';
    }

    return status;
  }

  private priorityLabel(
    priority: string,
  ) {
    return (
      priority
        .charAt(0)
        .toUpperCase() +
      priority
        .slice(1)
        .toLowerCase()
    );
  }

  private dateKey(
    value: Date,
  ) {
    return value
      .toISOString()
      .slice(0, 10);
  }

  private formatDate(
    value: Date,
  ) {
    return value.toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      },
    );
  }
}
