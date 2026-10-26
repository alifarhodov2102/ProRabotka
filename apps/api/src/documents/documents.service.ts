import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  promises as fs,
} from 'node:fs';

import path from 'node:path';

import {
  PrismaService,
} from '../prisma/prisma.service.js';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma:
      PrismaService,
  ) {}

  findAll(filters: {
    section?: string;
    spaceId?: string;
    folderId?: string;
    startupId?: string;
    residentId?: string;
    infrastructureId?: string;
    talentId?: string;
  }) {
    return this.prisma.document.findMany({
      where: {
        ...(filters.section && {
          section:
            filters.section as any,
        }),

        ...(filters.spaceId && {
          spaceId:
            filters.spaceId,
        }),

        ...(filters.folderId && {
          folderId:
            filters.folderId,
        }),

        ...(filters.startupId && {
          startupId:
            filters.startupId,
        }),

        ...(filters.residentId && {
          residentId:
            filters.residentId,
        }),

        ...(filters.infrastructureId && {
          infrastructureId:
            filters.infrastructureId,
        }),

        ...(filters.talentId && {
          talentId:
            filters.talentId,
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

        talent: {
          select: {
            id: true,
            fullName: true,
            position: true,
          },
        },
      },

      orderBy: {
        createdAt:
          'desc',
      },
    });
  }

  async findOne(
    id: string,
  ) {
    const document =
      await this.prisma.document.findUnique({
        where: {
          id,
        },

        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
            },
          },

          space: true,
          folder: true,

          startup: true,
          resident: true,
          infrastructure: true,
          talent: true,
        },
      });

    if (!document) {
      throw new NotFoundException(
        'Document not found',
      );
    }

    return document;
  }

  async create(
    file:
      Express.Multer.File,

    userId: string,

    data: {
      section: string;
      spaceId?: string;
      folderId?: string;

      residentId?: string;
      startupId?: string;
      infrastructureId?: string;
      talentId?: string;

      description?: string;
    },
  ) {
    if (!file) {
      throw new BadRequestException(
        'File is required',
      );
    }

    if (
      !data.section
    ) {
      throw new BadRequestException(
        'Document section is required',
      );
    }

    return this.prisma.document.create({
      data: {
        fileName:
          file.filename,

        originalName:
          file.originalname,

        fileUrl:
          `/documents/${file.filename}`,

        storageKey:
          file.path,

        mimeType:
          file.mimetype,

        fileSize:
          file.size,

        description:
          data.description
            ?.trim() ||
          null,

        section:
          data.section as any,

        uploadedById:
          userId,

        spaceId:
          data.spaceId ||
          null,

        folderId:
          data.folderId ||
          null,

        residentId:
          data.residentId ||
          null,

        startupId:
          data.startupId ||
          null,

        infrastructureId:
          data.infrastructureId ||
          null,

        talentId:
          data.talentId ||
          null,
      },

      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
          },
        },

        talent: {
          select: {
            id: true,
            fullName: true,
            position: true,
          },
        },
      },
    });
  }

  async replaceFile(
    id: string,

    file:
      Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        'File is required',
      );
    }

    const document =
      await this.findOne(
        id,
      );

    const currentName =
      document.originalName ||
      document.fileName;

    const currentExtension =
      path.extname(
        currentName,
      )
        .toLowerCase();

    const replacementExtension =
      path.extname(
        file.originalname,
      )
        .toLowerCase();

    if (
      currentExtension &&
      replacementExtension &&
      currentExtension !==
        replacementExtension
    ) {
      try {
        await fs.unlink(
          path.resolve(
            file.path,
          ),
        );
      } catch {
        // Ignore cleanup failure.
      }

      throw new BadRequestException(
        `File extension must remain ${currentExtension}`,
      );
    }

    const updated =
      await this.prisma.document.update({
        where: {
          id,
        },

        data: {
          fileName:
            file.filename,

          fileUrl:
            `/documents/${file.filename}`,

          storageKey:
            file.path,

          mimeType:
            file.mimetype,

          fileSize:
            file.size,

          originalName:
            document.originalName ||
            file.originalname,
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
      });

    if (
      document.storageKey !==
      file.path
    ) {
      try {
        await fs.unlink(
          path.resolve(
            document.storageKey,
          ),
        );
      } catch {
        // Previous stored file may already be missing.
      }
    }

    return updated;
  }

  async update(
    id: string,

    data: {
      originalName?: string;
      description?:
        | string
        | null;
    },
  ) {
    const document =
      await this.findOne(
        id,
      );

    const updateData:
      Record<
        string,
        any
      > = {};

    if (
      data.originalName !==
      undefined
    ) {
      const originalName =
        data.originalName.trim();

      if (!originalName) {
        throw new BadRequestException(
          'File name is required',
        );
      }

      const currentName =
        document.originalName ||
        document.fileName;

      const currentExtension =
        path.extname(
          currentName,
        );

      const newExtension =
        path.extname(
          originalName,
        );

      let finalName =
        originalName;

      if (
        currentExtension &&
        !newExtension
      ) {
        finalName =
          `${originalName}${currentExtension}`;
      }

      if (
        currentExtension &&
        newExtension &&
        currentExtension.toLowerCase() !==
          newExtension.toLowerCase()
      ) {
        throw new BadRequestException(
          `File extension must remain ${currentExtension}`,
        );
      }

      updateData.originalName =
        finalName;
    }

    if (
      data.description !==
      undefined
    ) {
      updateData.description =
        data.description
          ?.trim() ||
        null;
    }

    return this.prisma.document.update({
      where: {
        id,
      },

      data:
        updateData,

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
    });
  }

  async remove(
    id: string,
  ) {
    const document =
      await this.findOne(
        id,
      );

    try {
      await fs.unlink(
        path.resolve(
          document.storageKey,
        ),
      );
    } catch {
      // Stored file may already be missing.
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
