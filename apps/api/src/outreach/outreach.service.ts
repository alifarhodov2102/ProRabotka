import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'REPLIED'
  | 'FOLLOW_UP'
  | 'MEETING_PLANNED'
  | 'INTERESTED'
  | 'NOT_INTERESTED'
  | 'NO_RESPONSE';

const leadStatuses: LeadStatus[] = [
  'NEW',
  'CONTACTED',
  'REPLIED',
  'FOLLOW_UP',
  'MEETING_PLANNED',
  'INTERESTED',
  'NOT_INTERESTED',
  'NO_RESPONSE',
];

@Injectable()
export class OutreachService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    const [total, contacted, replied, meetings, interested, followUps] =
      await Promise.all([
        this.prisma.lead.count(),
        this.prisma.lead.count({
          where: {
            status: {
              in: [
                'CONTACTED',
                'REPLIED',
                'FOLLOW_UP',
                'MEETING_PLANNED',
                'INTERESTED',
              ] as any,
            },
          },
        }),
        this.prisma.lead.count({ where: { status: 'REPLIED' } }),
        this.prisma.lead.count({ where: { status: 'MEETING_PLANNED' } }),
        this.prisma.lead.count({ where: { status: 'INTERESTED' } }),
        this.prisma.lead.findMany({
          where: {
            nextFollowUpAt: { not: null },
            status: { not: 'NOT_INTERESTED' },
          },
          select: {
            id: true,
            companyName: true,
            country: true,
            status: true,
            nextFollowUpAt: true,
            owner: {
              select: { id: true, name: true },
            },
          },
          orderBy: { nextFollowUpAt: 'asc' },
        }),
      ]);

    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const overdue = followUps.filter(
      (lead) =>
        lead.nextFollowUpAt &&
        lead.nextFollowUpAt < todayStart,
    );

    const today = followUps.filter(
      (lead) =>
        lead.nextFollowUpAt &&
        lead.nextFollowUpAt >= todayStart &&
        lead.nextFollowUpAt < tomorrowStart,
    );

    return {
      total,
      contacted,
      replied,
      meetings,
      interested,
      followUpsToday: today.length,
      overdueFollowUps: overdue.length,
      attention: [
        ...overdue.map((lead) => ({
          ...lead,
          attentionType: 'OVERDUE' as const,
        })),
        ...today.map((lead) => ({
          ...lead,
          attentionType: 'TODAY' as const,
        })),
      ].slice(0, 8),
    };
  }

  findLeads() {
    return this.prisma.lead.findMany({
      include: {
        campaign: {
          select: { id: true, name: true, country: true },
        },
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: [
        { nextFollowUpAt: 'asc' },
        { updatedAt: 'desc' },
      ],
    });
  }

  async createLead(userId: string, data: any) {
    const companyName = data.companyName?.trim();
    const country = data.country?.trim();

    if (!companyName) {
      throw new BadRequestException('Company name is required');
    }

    if (!country) {
      throw new BadRequestException('Country is required');
    }

    return this.prisma.lead.create({
      data: {
        companyName,
        country,
        city: this.clean(data.city),
        industry: this.clean(data.industry),
        website: this.clean(data.website),
        companyLinkedIn: this.clean(data.companyLinkedIn),
        contactName: this.clean(data.contactName),
        contactPosition: this.clean(data.contactPosition),
        contactEmail: this.clean(data.contactEmail),
        contactPhone: this.clean(data.contactPhone),
        contactLinkedIn: this.clean(data.contactLinkedIn),
        source: this.clean(data.source),
        channel: this.clean(data.channel),
        status: this.parseLeadStatus(data.status) as any,
        lastContactAt: this.parseDate(data.lastContactAt),
        nextFollowUpAt: this.parseDate(data.nextFollowUpAt),
        notes: this.clean(data.notes),
        campaignId: this.clean(data.campaignId),
        ownerId: this.clean(data.ownerId) || userId,
        createdById: userId,
      },
      include: {
        campaign: {
          select: { id: true, name: true, country: true },
        },
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async updateLead(id: string, data: any) {
    await this.ensureLead(id);

    const updateData: any = {};
    const textFields = [
      'companyName',
      'country',
      'city',
      'industry',
      'website',
      'companyLinkedIn',
      'contactName',
      'contactPosition',
      'contactEmail',
      'contactPhone',
      'contactLinkedIn',
      'source',
      'channel',
      'notes',
      'campaignId',
      'ownerId',
    ];

    for (const field of textFields) {
      if (data[field] !== undefined) {
        updateData[field] = this.clean(data[field]);
      }
    }

    if (data.companyName !== undefined && !updateData.companyName) {
      throw new BadRequestException('Company name is required');
    }

    if (data.country !== undefined && !updateData.country) {
      throw new BadRequestException('Country is required');
    }

    if (data.status !== undefined) {
      updateData.status = this.parseLeadStatus(data.status);
    }

    if (data.lastContactAt !== undefined) {
      updateData.lastContactAt = this.parseDate(data.lastContactAt);
    }

    if (data.nextFollowUpAt !== undefined) {
      updateData.nextFollowUpAt = this.parseDate(data.nextFollowUpAt);
    }

    return this.prisma.lead.update({
      where: { id },
      data: updateData,
      include: {
        campaign: {
          select: { id: true, name: true, country: true },
        },
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async deleteLead(id: string) {
    await this.ensureLead(id);
    await this.prisma.lead.delete({ where: { id } });
    return { success: true };
  }

  findCampaigns() {
    return this.prisma.outreachCampaign.findMany({
      include: {
        _count: { select: { leads: true } },
        leads: { select: { status: true } },
      },
      orderBy: [
        { startDate: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  createCampaign(userId: string, data: any) {
    const name = data.name?.trim();
    const country = data.country?.trim();

    if (!name) {
      throw new BadRequestException('Campaign name is required');
    }

    if (!country) {
      throw new BadRequestException('Country is required');
    }

    return this.prisma.outreachCampaign.create({
      data: {
        name,
        country,
        city: this.clean(data.city),
        startDate: this.parseDate(data.startDate),
        endDate: this.parseDate(data.endDate),
        targetSectors: this.clean(data.targetSectors),
        description: this.clean(data.description),
        createdById: userId,
      },
    });
  }

  async updateCampaign(id: string, data: any) {
    await this.ensureCampaign(id);
    const updateData: any = {};

    for (const field of [
      'name',
      'country',
      'city',
      'targetSectors',
      'description',
    ]) {
      if (data[field] !== undefined) {
        updateData[field] = this.clean(data[field]);
      }
    }

    if (data.name !== undefined && !updateData.name) {
      throw new BadRequestException('Campaign name is required');
    }

    if (data.country !== undefined && !updateData.country) {
      throw new BadRequestException('Country is required');
    }

    if (data.startDate !== undefined) {
      updateData.startDate = this.parseDate(data.startDate);
    }

    if (data.endDate !== undefined) {
      updateData.endDate = this.parseDate(data.endDate);
    }

    return this.prisma.outreachCampaign.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteCampaign(id: string) {
    await this.ensureCampaign(id);
    await this.prisma.outreachCampaign.delete({ where: { id } });
    return { success: true };
  }

  private async ensureLead(id: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  private async ensureCampaign(id: string) {
    const campaign = await this.prisma.outreachCampaign.findUnique({
      where: { id },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  private parseLeadStatus(value?: string): LeadStatus {
    if (!value) return 'NEW';
    if (!leadStatuses.includes(value as LeadStatus)) {
      throw new BadRequestException('Invalid lead status');
    }
    return value as LeadStatus;
  }

  private parseDate(value?: string | null) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date');
    }
    return date;
  }

  private clean(value: unknown) {
    if (typeof value !== 'string') return null;
    const cleaned = value.trim();
    return cleaned || null;
  }
}
