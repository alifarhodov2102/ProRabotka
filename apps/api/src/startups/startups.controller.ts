import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { StartupsService } from './startups.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('startups')
@UseGuards(JwtAuthGuard)
export class StartupsController {
  constructor(
    private readonly startupsService: StartupsService,
  ) {}

  @Get()
  findAll() {
    return this.startupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.startupsService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.startupsService.create(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.startupsService.update(id, body);
  }

  @Post(':id/archive')
  archive(@Param('id') id: string) {
    return this.startupsService.archive(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.startupsService.remove(id);
  }
}