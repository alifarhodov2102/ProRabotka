import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import {
  FileInterceptor,
} from '@nestjs/platform-express';

import {
  diskStorage,
} from 'multer';

import {
  extname,
  join,
} from 'path';

import {
  mkdirSync,
} from 'fs';

import { StartupsService } from './startups.service.js';

const logoDirectory =
  join(
    process.cwd(),
    'storage',
    'startup-logos',
  );

mkdirSync(
  logoDirectory,
  {
    recursive: true,
  },
);

@Controller('startups')
export class StartupsController {
  constructor(
    private readonly startupsService:
      StartupsService,
  ) {}

  @Get()
  findAll() {
    return this.startupsService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.startupsService.findOne(
      id,
    );
  }

  @Post()
  create(
    @Body()
    body: {
      name?: string;
      founderName?: string | null;
      phone?: string | null;
      email?: string | null;
      stage?: string | null;
      status?: string;
      joinedAt?: string | null;
      notes?: string | null;
      logoUrl?: string | null;
    },
  ) {
    return this.startupsService.create(
      body,
    );
  }

  @Patch(':id')
  update(
    @Param('id')
    id: string,

    @Body()
    body: {
      name?: string;
      founderName?: string | null;
      phone?: string | null;
      email?: string | null;
      stage?: string | null;
      status?: string;
      joinedAt?: string | null;
      notes?: string | null;
      logoUrl?: string | null;
    },
  ) {
    return this.startupsService.update(
      id,
      body,
    );
  }

  @Post(':id/archive')
  archive(
    @Param('id')
    id: string,
  ) {
    return this.startupsService.archive(
      id,
    );
  }

  @Delete(':id')
  remove(
    @Param('id')
    id: string,
  ) {
    return this.startupsService.remove(
      id,
    );
  }

  @Post(':id/logo')
  @UseInterceptors(
    FileInterceptor(
      'file',
      {
        storage:
          diskStorage({
            destination: (
              req,
              file,
              callback,
            ) => {
              callback(
                null,
                logoDirectory,
              );
            },

            filename: (
              req,
              file,
              callback,
            ) => {
              const extension =
                extname(
                  file.originalname,
                )
                  .toLowerCase();

              const safeName =
                `${Date.now()}-${Math.round(
                  Math.random() *
                    1_000_000_000,
                )}${extension}`;

              callback(
                null,
                safeName,
              );
            },
          }),

        limits: {
          fileSize:
            5 * 1024 * 1024,
        },

        fileFilter: (
          req,
          file,
          callback,
        ) => {
          const allowed =
            [
              'image/png',
              'image/jpeg',
              'image/webp',
              'image/svg+xml',
            ];

          if (
            !allowed.includes(
              file.mimetype,
            )
          ) {
            callback(
              new BadRequestException(
                'Logo must be PNG, JPG, WEBP or SVG',
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
  uploadLogo(
    @Param('id')
    id: string,

    @UploadedFile()
    file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Logo file is required',
      );
    }

    return this.startupsService.updateLogo(
      id,
      `/startup-logos/${file.filename}`,
    );
  }

  @Post(':id/funding')
  addFunding(
    @Param('id')
    startupId: string,

    @Body()
    body: {
      type?: string;

      amount?:
        | number
        | string
        | null;

      currency?:
        | string
        | null;

      source?:
        | string
        | null;

      round?:
        | string
        | null;

      fundedAt?:
        | string
        | null;

      notes?:
        | string
        | null;
    },
  ) {
    return this.startupsService.addFunding(
      startupId,
      body,
    );
  }

  @Patch(
    ':id/funding/:fundingId',
  )
  updateFunding(
    @Param('id')
    startupId: string,

    @Param('fundingId')
    fundingId: string,

    @Body()
    body: {
      type?: string;

      amount?:
        | number
        | string
        | null;

      currency?:
        | string
        | null;

      source?:
        | string
        | null;

      round?:
        | string
        | null;

      fundedAt?:
        | string
        | null;

      notes?:
        | string
        | null;
    },
  ) {
    return this.startupsService.updateFunding(
      startupId,
      fundingId,
      body,
    );
  }

  @Delete(
    ':id/funding/:fundingId',
  )
  removeFunding(
    @Param('id')
    startupId: string,

    @Param('fundingId')
    fundingId: string,
  ) {
    return this.startupsService.removeFunding(
      startupId,
      fundingId,
    );
  }
}