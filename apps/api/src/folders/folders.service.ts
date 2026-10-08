import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class FoldersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    const folder = await this.prisma.folder.findUnique({
      where: { id },

      include: {
        children: {
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

        space: true,
        parent: true,
      },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    return folder;
  }

  async create(data: {
    name: string;
    spaceId: string;
    parentId?: string;
  }) {
    if (!data.name?.trim()) {
      throw new BadRequestException('Folder name is required');
    }

    const space = await this.prisma.space.findUnique({
      where: {
        id: data.spaceId,
      },
    });

    if (!space) {
      throw new NotFoundException('Space not found');
    }

    if (data.parentId) {
      const parent = await this.prisma.folder.findUnique({
        where: {
          id: data.parentId,
        },
      });

      if (!parent || parent.spaceId !== data.spaceId) {
        throw new BadRequestException(
          'Parent folder does not belong to this space',
        );
      }
    }

    return this.prisma.folder.create({
      data: {
        name: data.name.trim(),
        spaceId: data.spaceId,
        parentId: data.parentId || null,
      },
    });
  }

  async update(
    id: string,
    data: {
      name: string;
    },
  ) {
    await this.findOne(id);

    return this.prisma.folder.update({
      where: { id },

      data: {
        name: data.name.trim(),
      },
    });
  }

  async remove(id: string) {
    const folder = await this.prisma.folder.findUnique({
      where: { id },

      include: {
        _count: {
          select: {
            children: true,
            documents: true,
          },
        },
      },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    if (
      folder._count.children > 0 ||
      folder._count.documents > 0
    ) {
      throw new BadRequestException(
        'Folder is not empty',
      );
    }

    await this.prisma.folder.delete({
      where: { id },
    });

    return {
      success: true,
    };
  }
}