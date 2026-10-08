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

import { FoldersService } from './folders.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('folders')
@UseGuards(JwtAuthGuard)
export class FoldersController {
  constructor(
    private readonly foldersService: FoldersService,
  ) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.foldersService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.foldersService.create(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.foldersService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.foldersService.remove(id);
  }
}