import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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

import fs from 'node:fs';
import path from 'node:path';

import {
  randomUUID,
} from 'node:crypto';

import type {
  Response,
} from 'express';

import {
  JwtAuthGuard,
} from '../auth/jwt-auth.guard.js';

import {
  TalentsService,
} from './talents.service.js';

const photoDirectory =
  path.resolve(
    'storage/talent-photos',
  );

@UseGuards(
  JwtAuthGuard,
)
@Controller(
  'talents',
)
export class TalentsController {
  constructor(
    private readonly talentsService:
      TalentsService,
  ) {}

  @Get()
  findAll() {
    return this.talentsService.findAll();
  }

  @Get('export')
  async exportExcel(
    @Res()
    response:
      Response,
  ) {
    const buffer =
      await this.talentsService.exportExcel();

    const date =
      new Date()
        .toISOString()
        .slice(
          0,
          10,
        );

    response.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    response.setHeader(
      'Content-Disposition',
      `attachment; filename="talents-${date}.xlsx"`,
    );

    response.end(
      buffer,
    );
  }

  @Get(':id')
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.talentsService.findOne(
      id,
    );
  }

  @Post()
  create(
    @Body()
    body: any,
  ) {
    return this.talentsService.create(
      body,
    );
  }

  @Patch(':id')
  update(
    @Param('id')
    id: string,

    @Body()
    body: any,
  ) {
    return this.talentsService.update(
      id,
      body,
    );
  }

  @Delete(':id')
  remove(
    @Param('id')
    id: string,
  ) {
    return this.talentsService.remove(
      id,
    );
  }

  @Post(':id/photo')
  @UseInterceptors(
    FileInterceptor(
      'file',
      {
        storage:
          diskStorage({
            destination: (
              _request,
              _file,
              callback,
            ) => {
              fs.mkdirSync(
                photoDirectory,
                {
                  recursive:
                    true,
                },
              );

              callback(
                null,
                photoDirectory,
              );
            },

            filename: (
              _request,
              file,
              callback,
            ) => {
              const extension =
                path
                  .extname(
                    file.originalname,
                  )
                  .toLowerCase();

              callback(
                null,
                `${randomUUID()}${extension}`,
              );
            },
          }),

        limits: {
          fileSize:
            5 *
            1024 *
            1024,
        },

        fileFilter: (
          _request,
          file,
          callback,
        ) => {
          const allowed = [
            'image/png',
            'image/jpeg',
            'image/webp',
          ];

          if (
            !allowed.includes(
              file.mimetype,
            )
          ) {
            callback(
              new BadRequestException(
                'Photo must be PNG, JPG or WEBP',
              ),
              false,
            );

            return;
          }

          callback(
            null,
            true,
          );
        },
      },
    ),
  )
  uploadPhoto(
    @Param('id')
    id: string,

    @UploadedFile()
    file?:
      Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Photo file is required',
      );
    }

    return this.talentsService.updatePhoto(
      id,
      `/talent-photos/${file.filename}`,
    );
  }

  @Post(':id/skills')
  addSkill(
    @Param('id')
    id: string,

    @Body()
    body: {
      name?: string;
    },
  ) {
    return this.talentsService.addSkill(
      id,
      body,
    );
  }

  @Delete(
    ':id/skills/:skillId',
  )
  removeSkill(
    @Param('id')
    id: string,

    @Param('skillId')
    skillId: string,
  ) {
    return this.talentsService.removeSkill(
      id,
      skillId,
    );
  }

  @Post(':id/languages')
  addLanguage(
    @Param('id')
    id: string,

    @Body()
    body: {
      language?: string;
      level?: string;
    },
  ) {
    return this.talentsService.addLanguage(
      id,
      body,
    );
  }

  @Patch(
    ':id/languages/:languageId',
  )
  updateLanguage(
    @Param('id')
    id: string,

    @Param('languageId')
    languageId: string,

    @Body()
    body: {
      language?: string;
      level?: string;
    },
  ) {
    return this.talentsService.updateLanguage(
      id,
      languageId,
      body,
    );
  }

  @Delete(
    ':id/languages/:languageId',
  )
  removeLanguage(
    @Param('id')
    id: string,

    @Param('languageId')
    languageId: string,
  ) {
    return this.talentsService.removeLanguage(
      id,
      languageId,
    );
  }
}