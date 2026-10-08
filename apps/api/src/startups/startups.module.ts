import { Module } from '@nestjs/common';

import { StartupsController } from './startups.controller.js';
import { StartupsService } from './startups.service.js';

@Module({
  controllers: [StartupsController],
  providers: [StartupsService],
})
export class StartupsModule {}