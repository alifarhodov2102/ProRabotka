import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import type {
  Request,
} from 'express';

import {
  JwtAuthGuard,
} from '../auth/jwt-auth.guard.js';

import {
  UsersService,
} from './users.service.js';

type AuthenticatedRequest =
  Request & {
    user: {
      id: string;
      email: string;
      isSuperAdmin?:
        boolean;
    };
  };

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService:
      UsersService,
  ) {}

  @Get()
  findAll(
    @Query(
      'includeInactive',
    )
    includeInactive?: string,
  ) {
    return this.usersService.findAll(
      includeInactive ===
        'true',
    );
  }

  @Get('pending')
  findPending(
    @Req()
    request:
      AuthenticatedRequest,
  ) {
    return this.usersService.findPending(
      request.user.email,
    );
  }

  @Get(':id')
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.usersService.findOne(
      id,
    );
  }

  @Post()
  create(
    @Req()
    request:
      AuthenticatedRequest,

    @Body()
    body: any,
  ) {
    return this.usersService.create(
      request.user.email,
      body,
    );
  }

  @Patch(':id')
  update(
    @Req()
    request:
      AuthenticatedRequest,

    @Param('id')
    id: string,

    @Body()
    body: any,
  ) {
    return this.usersService.update(
      request.user.email,
      id,
      body,
    );
  }

  @Post(':id/approve')
  approve(
    @Req()
    request:
      AuthenticatedRequest,

    @Param('id')
    id: string,
  ) {
    return this.usersService.approve(
      request.user.email,
      id,
    );
  }

  @Post(':id/reject')
  reject(
    @Req()
    request:
      AuthenticatedRequest,

    @Param('id')
    id: string,
  ) {
    return this.usersService.reject(
      request.user.email,
      id,
    );
  }

  @Post(':id/deactivate')
  deactivate(
    @Req()
    request:
      AuthenticatedRequest,

    @Param('id')
    id: string,
  ) {
    return this.usersService.deactivate(
      request.user.email,
      id,
    );
  }

  @Post(':id/reactivate')
  reactivate(
    @Req()
    request:
      AuthenticatedRequest,

    @Param('id')
    id: string,
  ) {
    return this.usersService.reactivate(
      request.user.email,
      id,
    );
  }

  @Post(
    ':id/reset-password',
  )
  resetPassword(
    @Req()
    request:
      AuthenticatedRequest,

    @Param('id')
    id: string,

    @Body()
    body: {
      password: string;
    },
  ) {
    return this.usersService.resetPassword(
      request.user.email,
      id,
      body.password,
    );
  }
}