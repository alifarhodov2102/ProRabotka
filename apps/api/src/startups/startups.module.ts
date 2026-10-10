import {
  Module,
} from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module.js';

import { StartupsController } from './startups.controller.js';
import { StartupsService } from './startups.service.js';

@Module({
  imports: [
    PrismaModule,
  ],

  controllers: [
    StartupsController,
  ],

  providers: [
    StartupsService,
  ],

  exports: [
    StartupsService,
  ],
})
export class StartupsModule {}