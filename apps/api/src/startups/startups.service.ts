import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

type StartupInput = {
  name: string;
  founderName?: string;
  phone?: string;
  email?: string;
  stage?: string;
  status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
  joinedAt?: string;
  notes?: string;
};

@Injectable()
export class StartupsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.startup.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const startup = await this.prisma.startup.findUnique({
      where: { id },

      include: {
        documents: {
          orderBy: {
            createdAt: 'desc',
          },
        },

        tasks: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!startup) {
      throw new NotFoundException('Startup not found');
    }

    return startup;
  }

  create(data: StartupInput) {
    if (!data.name?.trim()) {
      throw new BadRequestException('Startup name is required');
    }

    return this.prisma.startup.create({
      data: {
        name: data.name.trim(),
        founderName: data.founderName?.trim() || null,
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
        stage: data.stage?.trim() || null,
        status: data.status ?? 'ACTIVE',

        joinedAt: data.joinedAt
          ? new Date(data.joinedAt)
          : null,

        notes: data.notes?.trim() || null,
      },
    });
  }

  async update(
    id: string,
    data: Partial<StartupInput>,
  ) {
    await this.findOne(id);

    return this.prisma.startup.update({
      where: { id },

      data: {
        ...(data.name !== undefined && {
          name: data.name.trim(),
        }),

        ...(data.founderName !== undefined && {
          founderName: data.founderName.trim() || null,
        }),

        ...(data.phone !== undefined && {
          phone: data.phone.trim() || null,
        }),

        ...(data.email !== undefined && {
          email: data.email.trim() || null,
        }),

        ...(data.stage !== undefined && {
          stage: data.stage.trim() || null,
        }),

        ...(data.status !== undefined && {
          status: data.status,
        }),

        ...(data.joinedAt !== undefined && {
          joinedAt: data.joinedAt
            ? new Date(data.joinedAt)
            : null,
        }),

        ...(data.notes !== undefined && {
          notes: data.notes.trim() || null,
        }),
      },
    });
  }

  async archive(id: string) {
    await this.findOne(id);

    return this.prisma.startup.update({
      where: { id },

      data: {
        status: 'ARCHIVED',
      },
    });
  }

  async remove(id: string) {
    const startup = await this.prisma.startup.findUnique({
      where: { id },

      include: {
        _count: {
          select: {
            tasks: true,
            documents: true,
          },
        },
      },
    });

    if (!startup) {
      throw new NotFoundException('Startup not found');
    }

    if (
      startup._count.tasks > 0 ||
      startup._count.documents > 0
    ) {
      throw new BadRequestException(
        'This startup has linked data. Archive it instead of deleting it.',
      );
    }

    await this.prisma.startup.delete({
      where: { id },
    });

    return {
      success: true,
    };
  }
}