import {
  Module,
} from '@nestjs/common';

import {
  PrismaModule,
} from '../prisma/prisma.module.js';

import {
  TalentsController,
} from './talents.controller.js';

import {
  TalentsService,
} from './talents.service.js';

@Module({
  imports: [
    PrismaModule,
  ],

  controllers: [
    TalentsController,
  ],

  providers: [
    TalentsService,
  ],

  exports: [
    TalentsService,
  ],
})
export class TalentsModule {}