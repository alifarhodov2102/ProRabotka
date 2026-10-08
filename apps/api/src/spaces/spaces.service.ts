import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

type Section =
  | 'STARTUPS'
  | 'RESIDENTS'
  | 'INFRASTRUCTURE'
  | 'GENERAL';

@Injectable()
export class SpacesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(section?: Section) {
    return this.prisma.space.findMany({
      where: section
        ? {
            section,
          }
        : undefined,

      include: {
        _count: {
          select: {
            folders: true,
            documents: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const space = await this.prisma.space.findUnique({
      where: { id },

      include: {
        folders: {
          where: {
            parentId: null,
          },

          include: {
            _count: {
              select: {
                documents: true,
                children: true,
              },
            },
          },

          orderBy: {
            name: 'asc',
          },
        },

        documents: {
          where: {
            folderId: null,
          },

          include: {
            uploadedBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },

          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!space) {
      throw new NotFoundException('Space not found');
    }

    return space;
  }

  create(data: {
    name: string;
    description?: string;
    section: Section;
  }) {
    if (!data.name?.trim()) {
      throw new BadRequestException('Space name is required');
    }

    return this.prisma.space.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        section: data.section,
      },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
    },
  ) {
    await this.findOne(id);

    return this.prisma.space.update({
      where: { id },

      data: {
        ...(data.name !== undefined && {
          name: data.name.trim(),
        }),

        ...(data.description !== undefined && {
          description: data.description.trim() || null,
        }),
      },
    });
  }

  async remove(id: string) {
    const space = await this.prisma.space.findUnique({
      where: { id },

      include: {
        _count: {
          select: {
            folders: true,
            documents: true,
          },
        },
      },
    });

    if (!space) {
      throw new NotFoundException('Space not found');
    }

    if (
      space._count.folders > 0 ||
      space._count.documents > 0
    ) {
      throw new BadRequestException(
        'This space contains folders or documents.',
      );
    }

    await this.prisma.space.delete({
      where: { id },
    });

    return {
      success: true,
    };
  }
}