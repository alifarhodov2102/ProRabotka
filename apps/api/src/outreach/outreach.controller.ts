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
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { OutreachService } from './outreach.service.js';

type AuthenticatedRequest = Request & {
  user: { id: string; email: string };
};

@Controller('outreach')
@UseGuards(JwtAuthGuard)
export class OutreachController {
  constructor(private readonly outreachService: OutreachService) {}

  @Get('overview')
  overview() {
    return this.outreachService.overview();
  }

  @Get('leads')
  leads() {
    return this.outreachService.findLeads();
  }

  @Post('leads')
  createLead(@Req() request: AuthenticatedRequest, @Body() body: any) {
    return this.outreachService.createLead(request.user.id, body);
  }

  @Patch('leads/:id')
  updateLead(@Param('id') id: string, @Body() body: any) {
    return this.outreachService.updateLead(id, body);
  }

  @Delete('leads/:id')
  deleteLead(@Param('id') id: string) {
    return this.outreachService.deleteLead(id);
  }

  @Get('campaigns')
  campaigns() {
    return this.outreachService.findCampaigns();
  }

  @Post('campaigns')
  createCampaign(@Req() request: AuthenticatedRequest, @Body() body: any) {
    return this.outreachService.createCampaign(request.user.id, body);
  }

  @Patch('campaigns/:id')
  updateCampaign(@Param('id') id: string, @Body() body: any) {
    return this.outreachService.updateCampaign(id, body);
  }

  @Delete('campaigns/:id')
  deleteCampaign(@Param('id') id: string) {
    return this.outreachService.deleteCampaign(id);
  }
}
