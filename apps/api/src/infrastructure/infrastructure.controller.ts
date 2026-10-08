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

import { InfrastructureService } from './infrastructure.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('infrastructure')
@UseGuards(JwtAuthGuard)
export class InfrastructureController {
  constructor(
    private readonly infrastructureService: InfrastructureService,
  ) {}

  @Get()
  findAll() {
    return this.infrastructureService.findAll();
  }

  @Get('rooms')
  findRooms() {
    return this.infrastructureService.findRooms();
  }

  @Get('equipment')
  findEquipment() {
    return this.infrastructureService.findEquipment();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.infrastructureService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.infrastructureService.create(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.infrastructureService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.infrastructureService.remove(id);
  }
}