import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';

import type {
  Response,
} from 'express';

import { ResidentsService } from './residents.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('residents')
@UseGuards(JwtAuthGuard)
export class ResidentsController {
  constructor(
    private readonly residentsService: ResidentsService,
  ) {}

  @Get()
  findAll() {
    return this.residentsService.findAll();
  }

  @Get('export')
  async exportExcel(
    @Res()
    response: Response,
  ) {
    const buffer =
      await this.residentsService.exportExcel();

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
      `attachment; filename="sirdaryo-residents-${date}.xlsx"`,
    );

    response.end(
      buffer,
    );
  }

  @Get('applications')
  findApplications() {
    return this.residentsService.findApplications();
  }

  @Post('applications')
  createApplication(
    @Body()
    body: any,
  ) {
    return this.residentsService.createApplication(
      body,
    );
  }

  @Patch('applications/:id')
  updateApplication(
    @Param('id')
    id: string,

    @Body()
    body: any,
  ) {
    return this.residentsService.updateApplication(
      id,
      body,
    );
  }

  @Post('applications/:id/approve')
  approveApplication(
    @Param('id')
    id: string,
  ) {
    return this.residentsService.approveApplication(
      id,
    );
  }

  @Delete('applications/:id')
  removeApplication(
    @Param('id')
    id: string,
  ) {
    return this.residentsService.removeApplication(
      id,
    );
  }

  @Get(':id')
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.residentsService.findOne(
      id,
    );
  }

  @Post()
  create(
    @Body()
    body: any,
  ) {
    return this.residentsService.create(
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
    return this.residentsService.update(
      id,
      body,
    );
  }

  @Delete(':id')
  remove(
    @Param('id')
    id: string,
  ) {
    return this.residentsService.remove(
      id,
    );
  }

  @Post(':id/archive')
  archive(
    @Param('id')
    id: string,
  ) {
    return this.residentsService.archive(
      id,
    );
  }

  @Put(':id/reports/:year/:quarter')
  setQuarterReport(
    @Param('id')
    id: string,

    @Param(
      'year',
      ParseIntPipe,
    )
    year: number,

    @Param(
      'quarter',
      ParseIntPipe,
    )
    quarter: number,

    @Body()
    body: {
      status:
        | 'NOT_STARTED'
        | 'WAITING'
        | 'RECEIVED'
        | 'CHECKED'
        | 'MISSING';

      notes?: string;
    },
  ) {
    return this.residentsService.setQuarterReport(
      id,
      year,
      quarter,
      body,
    );
  }
}
