import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import type {
  Request,
} from 'express';

import {
  TasksService,
} from './tasks.service.js';

import {
  JwtAuthGuard,
} from '../auth/jwt-auth.guard.js';

type AuthenticatedRequest =
  Request & {
    user: {
      id: string;
    };
  };

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
  ) {}

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Get('my')
  findMyTasks(
    @Req()
    request: AuthenticatedRequest,
  ) {
    return this.tasksService.findMyTasks(
      request.user.id,
    );
  }

  @Get(':id')
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.tasksService.findOne(
      id,
    );
  }

  @Post()
  create(
    @Req()
    request: AuthenticatedRequest,

    @Body()
    body: any,
  ) {
    return this.tasksService.create(
      request.user.id,
      body,
    );
  }

  @Patch(':id')
  update(
    @Param('id')
    id: string,

    @Req()
    request: AuthenticatedRequest,

    @Body()
    body: any,
  ) {
    return this.tasksService.update(
      id,
      request.user.id,
      body,
    );
  }

  @Post(':id/comments')
  addComment(
    @Param('id')
    id: string,

    @Req()
    request: AuthenticatedRequest,

    @Body()
    body: {
      content: string;
    },
  ) {
    return this.tasksService.addComment(
      id,
      request.user.id,
      body.content,
    );
  }

  @Delete(
    ':id/comments/:commentId',
  )
  removeComment(
    @Param('id')
    id: string,

    @Param('commentId')
    commentId: string,

    @Req()
    request: AuthenticatedRequest,
  ) {
    return this.tasksService.removeComment(
      id,
      commentId,
      request.user.id,
    );
  }

  @Delete(':id')
  remove(
    @Param('id')
    id: string,
  ) {
    return this.tasksService.remove(
      id,
    );
  }
}