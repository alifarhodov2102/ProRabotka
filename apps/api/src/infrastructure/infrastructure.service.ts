import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

type InfrastructureInput = {
  name: string;
  type: 'ROOM' | 'EQUIPMENT';
  status?:
    | 'AVAILABLE'
    | 'IN_USE'
    | 'REPAIR'
    | 'BROKEN'
    | 'WRITTEN_OFF';

  roomNumber?: string;
  inventoryNo?: string;
  description?: string;
  location?: string;
  quantity?: number;
  capacity?: number;
  residentId?: string | null;
};

@Injectable()
export class InfrastructureService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.infrastructure.findMany({
      include: {
        resident: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findRooms() {
    return this.prisma.infrastructure.findMany({
      where: {
        type: 'ROOM',
      },

      include: {
        resident: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },

      orderBy: {
        name: 'asc',
      },
    });
  }

  findEquipment() {
    return this.prisma.infrastructure.findMany({
      where: {
        type: 'EQUIPMENT',
      },

      include: {
        resident: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.infrastructure.findUnique({
      where: { id },

      include: {
        resident: true,

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

    if (!item) {
      throw new NotFoundException('Infrastructure item not found');
    }

    return item;
  }

  async create(data: InfrastructureInput) {
    if (!data.name?.trim()) {
      throw new BadRequestException('Name is required');
    }

    if (
      data.type === 'EQUIPMENT' &&
      data.inventoryNo
    ) {
      const duplicate =
        await this.prisma.infrastructure.findUnique({
          where: {
            inventoryNo: data.inventoryNo.trim(),
          },
        });

      if (duplicate) {
        throw new BadRequestException(
          'Equipment with this inventory number already exists',
        );
      }
    }

    return this.prisma.infrastructure.create({
      data: {
        name: data.name.trim(),
        type: data.type,
        status: data.status ?? 'AVAILABLE',

        roomNumber:
          data.roomNumber?.trim() || null,

        inventoryNo:
          data.inventoryNo?.trim() || null,

        description:
          data.description?.trim() || null,

        location:
          data.location?.trim() || null,

        quantity:
          data.quantity && data.quantity > 0
            ? data.quantity
            : 1,

        capacity:
          data.capacity && data.capacity > 0
            ? data.capacity
            : null,

        residentId:
          data.residentId || null,
      },
    });
  }

  async update(
    id: string,
    data: Partial<InfrastructureInput>,
  ) {
    await this.findOne(id);

    if (data.inventoryNo) {
      const duplicate =
        await this.prisma.infrastructure.findFirst({
          where: {
            inventoryNo: data.inventoryNo.trim(),

            NOT: {
              id,
            },
          },
        });

      if (duplicate) {
        throw new BadRequestException(
          'Equipment with this inventory number already exists',
        );
      }
    }

    return this.prisma.infrastructure.update({
      where: { id },

      data: {
        ...(data.name !== undefined && {
          name: data.name.trim(),
        }),

        ...(data.type !== undefined && {
          type: data.type,
        }),

        ...(data.status !== undefined && {
          status: data.status,
        }),

        ...(data.roomNumber !== undefined && {
          roomNumber:
            data.roomNumber?.trim() || null,
        }),

        ...(data.inventoryNo !== undefined && {
          inventoryNo:
            data.inventoryNo?.trim() || null,
        }),

        ...(data.description !== undefined && {
          description:
            data.description?.trim() || null,
        }),

        ...(data.location !== undefined && {
          location:
            data.location?.trim() || null,
        }),

        ...(data.quantity !== undefined && {
          quantity:
            data.quantity > 0 ? data.quantity : 1,
        }),

        ...(data.capacity !== undefined && {
          capacity:
            data.capacity && data.capacity > 0
              ? data.capacity
              : null,
        }),

        ...(data.residentId !== undefined && {
          residentId:
            data.residentId || null,
        }),
      },

      include: {
        resident: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const item = await this.prisma.infrastructure.findUnique({
      where: { id },

      include: {
        _count: {
          select: {
            tasks: true,
            documents: true,
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Infrastructure item not found');
    }

    if (
      item._count.tasks > 0 ||
      item._count.documents > 0
    ) {
      throw new BadRequestException(
        'This item has linked data and cannot be deleted.',
      );
    }

    await this.prisma.infrastructure.delete({
      where: { id },
    });

    return {
      success: true,
    };
  }
}