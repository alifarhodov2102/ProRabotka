import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Body,
  NotFoundException,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import {
  diskStorage,
} from 'multer';

import path from 'node:path';
import fs from 'node:fs';

import type {
  Request,
  Response,
} from 'express';

import { randomUUID } from 'node:crypto';

import { DocumentsService } from './documents.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

const uploadDirectory =
  path.resolve('storage/documents');

@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
  ) {}

  @Get()
  findAll(
    @Query('section')
    section?: string,

    @Query('spaceId')
    spaceId?: string,

    @Query('folderId')
    folderId?: string,
  ) {
    return this.documentsService.findAll({
      section,
      spaceId,
      folderId,
    });
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (
          _request,
          _file,
          callback,
        ) => {
          fs.mkdirSync(
            uploadDirectory,
            {
              recursive: true,
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
      }),

      limits: {
        fileSize:
          25 * 1024 * 1024,
      },
    }),
  )
  upload(
    @UploadedFile()
    file: Express.Multer.File,

    @Req()
    request: Request & {
      user: {
        id: string;
      };
    },

    @Body()
    body: any,
  ) {
    return this.documentsService.create(
      file,
      request.user.id,
      body,
    );
  }

  @Get(':id/download')
  async download(
    @Param('id')
    id: string,

    @Res()
    response: Response,
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