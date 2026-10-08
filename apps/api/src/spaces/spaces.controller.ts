import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { SpacesService } from './spaces.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('spaces')
@UseGuards(JwtAuthGuard)
export class SpacesController {
  constructor(
    private readonly spacesService: SpacesService,
  ) {}

  @Get()
  findAll(
    @Query('section')
    section?:
      | 'STARTUPS'
      | 'RESIDENTS'
      | 'INFRASTRUCTURE'
      | 'GENERAL',
  ) {
    return this.spacesService.findAll(section);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.spacesService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.spacesService.create(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.spacesService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.spacesService.remove(id);
  }
}