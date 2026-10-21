import {
  Module,
} from '@nestjs/common';

import {
  ConfigModule,
} from '@nestjs/config';

import {
  AppController,
} from './app.controller.js';

import {
  AppService,
} from './app.service.js';

import {
  PrismaModule,
} from './prisma/prisma.module.js';

import {
  AuthModule,
} from './auth/auth.module.js';

import {
  ResidentsModule,
} from './residents/residents.module.js';

import {
  StartupsModule,
} from './startups/startups.module.js';

import {
  TalentsModule,
} from './talents/talents.module.js';

import {
  InfrastructureModule,
} from './infrastructure/infrastructure.module.js';

import {
  SpacesModule,
} from './spaces/spaces.module.js';

import {
  FoldersModule,
} from './folders/folders.module.js';

import {
  DocumentsModule,
} from './documents/documents.module.js';

import {
  UsersModule,
} from './users/users.module.js';

import {
  TasksModule,
} from './tasks/tasks.module.js';

import {
  OutreachModule,
} from './outreach/outreach.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PrismaModule,

    AuthModule,
    UsersModule,
    TasksModule,

    OutreachModule,

    ResidentsModule,
    StartupsModule,
    TalentsModule,

    InfrastructureModule,

    SpacesModule,
    FoldersModule,
    DocumentsModule,
  ],

  controllers: [
    AppController,
  ],

  providers: [
    AppService,
  ],
})
export class AppModule {}