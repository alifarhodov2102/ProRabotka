import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

type ResidentInput = {
  companyName: string;
  tin?: string;
  activity?: string;
  exporter?: boolean;
  founderCountry?: string;
  region?: string;
  district?: string;
  residentSince?: string;
  focalPoint?: string;
  broughtBy?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  notes?: string;
};

type QuarterInput = {
  status:
    | 'NOT_STARTED'
    | 'WAITING'
    | 'RECEIVED'
    | 'CHECKED'
    | 'MISSING';
  notes?: string;
};

@Injectable()
export class ResidentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.resident.findMany({
      include: {
        quarterReports: {
          orderBy: [
            { year: 'desc' },
            { quarter: 'asc' },
          ],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const resident = await this.prisma.resident.findUnique({
      where: { id },

      include: {
        quarterReports: {
          orderBy: [
            { year: 'desc' },
            { quarter: 'asc' },
          ],
        },

        infrastructure: true,

        documents: {
          orderBy: {
            createdAt: 'desc',
          },
        },

        tasks: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!resident) {
      throw new NotFoundException('Resident not found');
    }

    return resident;
  }

  async create(data: ResidentInput) {
    if (!data.companyName?.trim()) {
      throw new BadRequestException('Company name is required');
    }

    if (data.tin) {
      const existing = await this.prisma.resident.findUnique({
        where: {
          tin: data.tin.trim(),
        },
      });

      if (existing) {
        throw new BadRequestException(
          'Resident with this STIR already exists',
        );
      }
    }

    return this.prisma.resident.create({
      data: {
        companyName: data.companyName.trim(),
        tin: data.tin?.trim() || null,
        activity: data.activity?.trim() || null,
        exporter: data.exporter ?? false,
        founderCountry: data.founderCountry?.trim() || null,
        region: data.region?.trim() || null,
        district: data.district?.trim() || null,

        residentSince: data.residentSince
          ? new Date(data.residentSince)
          : null,

        focalPoint: data.focalPoint?.trim() || null,
        broughtBy: data.broughtBy?.trim() || null,
        notes: data.notes?.trim() || null,
      },
    });
  }

  async update(id: string, data: Partial<ResidentInput>) {
    await this.findOne(id);

    if (data.tin) {
      const duplicate = await this.prisma.resident.findFirst({
        where: {
          tin: data.tin.trim(),
          NOT: {
            id,
          },
        },
      });

      if (duplicate) {
        throw new BadRequestException(
          'Resident with this STIR already exists',
        );
      }
    }

    return this.prisma.resident.update({
      where: { id },

      data: {
        ...(data.companyName !== undefined && {
          companyName: data.companyName.trim(),
        }),

        ...(data.tin !== undefined && {
          tin: data.tin.trim() || null,
        }),

        ...(data.activity !== undefined && {
          activity: data.activity.trim() || null,
        }),

        ...(data.exporter !== undefined && {
          exporter: data.exporter,
        }),

        ...(data.founderCountry !== undefined && {
          founderCountry:
            data.founderCountry.trim() || null,
        }),

        ...(data.region !== undefined && {
          region: data.region.trim() || null,
        }),

        ...(data.district !== undefined && {
          district: data.district.trim() || null,
        }),

        ...(data.residentSince !== undefined && {
          residentSince: data.residentSince
            ? new Date(data.residentSince)
            : null,
        }),

        ...(data.focalPoint !== undefined && {
          focalPoint: data.focalPoint.trim() || null,
        }),

        ...(data.broughtBy !== undefined && {
          broughtBy: data.broughtBy.trim() || null,
        }),

        ...(data.status !== undefined && {
          status: data.status,
        }),

        ...(data.notes !== undefined && {
          notes: data.notes.trim() || null,
        }),
      },
    });
  }

  async remove(id: string) {
    const resident = await this.prisma.resident.findUnique({
      where: { id },

      include: {
        _count: {
          select: {
            documents: true,
            tasks: true,
            infrastructure: true,
          },
        },
      },
    });

    if (!resident) {
      throw new NotFoundException('Resident not found');
    }

    const hasLinkedData =
      resident._count.documents > 0 ||
      resident._count.tasks > 0 ||
      resident._count.infrastructure > 0;

    if (hasLinkedData) {
      throw new BadRequestException(
        'This resident has linked data. Archive it instead of deleting it.',
      );
    }

    await this.prisma.resident.delete({
      where: { id },
    });

    return {
      success: true,
    };
  }

  async archive(id: string) {
    await this.findOne(id);

    return this.prisma.resident.update({
      where: { id },

      data: {
        status: 'ARCHIVED',
      },
    });
  }

  async setQuarterReport(
    residentId: string,
    year: number,
    quarter: number,
    data: QuarterInput,
  ) {
    await this.findOne(residentId);

    if (quarter < 1 || quarter > 4) {
      throw new BadRequestException(
        'Quarter must be between 1 and 4',
      );
    }

    const now = new Date();

    return this.prisma.quarterReport.upsert({
      where: {
        residentId_year_quarter: {
          residentId,
          year,
          quarter,
        },
      },

      update: {
        status: data.status,
        notes: data.notes?.trim() || null,

        receivedAt:
          data.status === 'RECEIVED' ||
          data.status === 'CHECKED'
            ? now
            : null,

        checkedAt:
          data.status === 'CHECKED'
            ? now
            : null,
      },

      create: {
        residentId,
        year,
        quarter,
        status: data.status,
        notes: data.notes?.trim() || null,

        receivedAt:
          data.status === 'RECEIVED' ||
          data.status === 'CHECKED'
            ? now
            : null,

        checkedAt:
          data.status === 'CHECKED'
            ? now
            : null,
      },
    });
  }
}