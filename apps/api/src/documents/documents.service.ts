import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { promises as fs } from 'node:fs';
import path from 'node:path';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filters: {
    section?: string;
    spaceId?: string;
    folderId?: string;
  }) {
    return this.prisma.document.findMany({
      where: {
        ...(filters.section && {
          section: filters.section as any,
        }),

        ...(filters.spaceId && {
          spaceId: filters.spaceId,
        }),

        ...(filters.folderId && {
          folderId: filters.folderId,
        }),
      },

      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
          },
        },

        space: {
          select: {
            id: true,
            name: true,
          },
        },

        folder: {
          select: {
            id: true,
            name: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },

      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
          },
        },

        space: true,
        folder: true,
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async create(
    file: Express.Multer.File,
    userId: string,
    data: {
      section: string;
      spaceId?: string;
      folderId?: string;
      residentId?: string;
      startupId?: string;
      infrastructureId?: string;
      description?: string;
    },
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.prisma.document.create({
      data: {
        fileName: file.filename,
        originalName: file.originalname,
        fileUrl: `/documents/download/${file.filename}`,
        storageKey: file.path,
        mimeType: file.mimetype,
        fileSize: file.size,

        description:
          data.description?.trim() || null,

        section: data.section as any,

        uploadedById: userId,

        spaceId: data.spaceId || null,
        folderId: data.folderId || null,

        residentId:
          data.residentId || null,

        startupId:
          data.startupId || null,

        infrastructureId:
          data.infrastructureId || null,
      },
    });
  }

  async remove(id: string) {
    const document = await this.findOne(id);

    try {
      await fs.unlink(
        path.resolve(document.storageKey),
      );
    } catch {
      // File may already be missing.
    }

    await this.prisma.document.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
    };
  }
}