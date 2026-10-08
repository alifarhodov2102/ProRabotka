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
  UseGuards,
} from '@nestjs/common';

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.residentsService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.residentsService.create(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.residentsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.residentsService.remove(id);
  }

  @Post(':id/archive')
  archive(@Param('id') id: string) {
    return this.residentsService.archive(id);
  }

  @Put(':id/reports/:year/:quarter')
  setQuarterReport(
    @Param('id') id: string,
    @Param('year', ParseIntPipe) year: number,
    @Param('quarter', ParseIntPipe) quarter: number,
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