import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import {
  FileInterceptor,
} from '@nestjs/platform-express';

import {
  diskStorage,
} from 'multer';

import path from 'node:path';
import fs from 'node:fs';

import type {
  Request,
  Response,
} from 'express';

import {
  randomUUID,
} from 'node:crypto';

import {
  DocumentsService,
} from './documents.service.js';

import {
  JwtAuthGuard,
} from '../auth/jwt-auth.guard.js';

const uploadDirectory =
  path.resolve(
    'storage/documents',
  );

function decodeFileName(
  fileName: string,
) {
  try {
    const decoded =
      Buffer.from(
        fileName,
        'latin1',
      ).toString(
        'utf8',
      );

    if (
      decoded.includes(
        '�',
      )
    ) {
      return fileName;
    }

    return decoded;
  } catch {
    return fileName;
  }
}

const fileStorage =
  diskStorage({
    destination: (
      _request,
      _file,
      callback,
    ) => {
      fs.mkdirSync(
        uploadDirectory,
        {
          recursive:
            true,
        },
      );

      callback(
        null,
        uploadDirectory,
      );
    },

    filename: (
      _request,
      file,
      callback,
    ) => {
      const extension =
        path.extname(
          file.originalname,
        );

      callback(
        null,
        `${randomUUID()}${extension}`,
      );
    },
  });

@UseGuards(
  JwtAuthGuard,
)
@Controller(
  'documents',
)
export class DocumentsController {
  constructor(
    private readonly documentsService:
      DocumentsService,
  ) {}

  @Get()
  findAll(
    @Query('section')
    section?: string,

    @Query('spaceId')
    spaceId?: string,

    @Query('folderId')
    folderId?: string,

    @Query('startupId')
    startupId?: string,

    @Query('residentId')
    residentId?: string,

    @Query('infrastructureId')
    infrastructureId?: string,

    @Query('talentId')
    talentId?: string,
  ) {
    return this.documentsService.findAll({
      section,
      spaceId,
      folderId,
      startupId,
      residentId,
      infrastructureId,
      talentId,
    });
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor(
      'file',
      {
        storage:
          fileStorage,

        limits: {
          fileSize:
            25 *
            1024 *
            1024,
        },
      },
    ),
  )
  upload(
    @UploadedFile()
    file:
      Express.Multer.File,

    @Req()
    request:
      Request & {
        user: {
          id: string;
        };
      },

    @Body()
    body: any,
  ) {
    if (file) {
      file.originalname =
        decodeFileName(
          file.originalname,
        );
    }

    return this.documentsService.create(
      file,
      request.user.id,
      body,
    );
  }

  @Post(':id/replace')
  @UseInterceptors(
    FileInterceptor(
      'file',
      {
        storage:
          fileStorage,

        limits: {
          fileSize:
            25 *
            1024 *
            1024,
        },
      },
    ),
  )
  replace(
    @Param('id')
    id: string,

    @UploadedFile()
    file:
      Express.Multer.File,
  ) {
    if (file) {
      file.originalname =
        decodeFileName(
          file.originalname,
        );
    }

    return this.documentsService.replaceFile(
      id,
      file,
    );
  }

  @Patch(':id')
  update(
    @Param('id')
    id: string,

    @Body()
    body: {
      originalName?: string;
      description?: string | null;
    },
  ) {
    return this.documentsService.update(
      id,
      body,
    );
  }

  @Get(':id/preview')
  async preview(
    @Param('id')
    id: string,

    @Res()
    response:
      Response,
  ) {
    const document =
      await this.documentsService.findOne(
        id,
      );

    const storagePath =
      path.resolve(
        document.storageKey,
      );

    if (
      !fs.existsSync(
        storagePath,
      )
    ) {
      throw new NotFoundException(
        'Stored file not found',
      );
    }

    const fileName =
      document.originalName ||
      document.fileName;

    response.setHeader(
      'Content-Type',
      document.mimeType ||
        'application/octet-stream',
    );

    response.setHeader(
      'Content-Disposition',
      `inline; filename*=UTF-8''${encodeURIComponent(
        fileName,
      )}`,
    );

    return response.sendFile(
      storagePath,
    );
  }

  @Get(':id/download')
  async download(
    @Param('id')
    id: string,

    @Res()
    response:
      Response,
  ) {
    const document =
      await this.documentsService.findOne(
        id,
      );

    if (
      !fs.existsSync(
        document.storageKey,
      )
    ) {
      throw new NotFoundException(
        'Stored file not found',
      );
    }

    return response.download(
      path.resolve(
        document.storageKey,
      ),

      document.originalName ||
        document.fileName,
    );
  }

  @Delete(':id')
  remove(
    @Param('id')
    id: string,
  ) {
    return this.documentsService.remove(
      id,
    );
  }
}
