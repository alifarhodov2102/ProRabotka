import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import * as bcrypt from 'bcrypt';

import {
  PrismaService,
} from '../prisma/prisma.service.js';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma:
      PrismaService,

    private readonly configService:
      ConfigService,
  ) {}

  findAll(
    includeInactive = false,
  ) {
    return this.prisma.user.findMany({
      where: {
        approvalStatus:
          'APPROVED',

        ...(includeInactive
          ? {}
          : {
              isActive:
                true,
            }),
      },

      select:
        this.userSelect(),

      orderBy: [
        {
          isActive: 'desc',
        },

        {
          name: 'asc',
        },
      ],
    });
  }

  async findPending(
    requesterEmail:
      string,
  ) {
    this.assertSuperAdmin(
      requesterEmail,
    );

    return this.prisma.user.findMany({
      where: {
        approvalStatus:
          'PENDING',
      },

      select:
        this.userSelect(),

      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findOne(
    id: string,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id,
        },

        select:
          this.userSelect(),
      });

    if (!user) {
      throw new NotFoundException(
        'Team member not found',
      );
    }

    return user;
  }

  async create(
    requesterEmail: string,
    data: {
      name: string;
      surname?: string;
      email: string;
      role?: string;
      position?: string;
      password: string;
    },
  ) {
    this.assertSuperAdmin(
      requesterEmail,
    );

    const name =
      data.name?.trim();

    const surname =
      data.surname?.trim();

    const email =
      data.email
        ?.trim()
        .toLowerCase();

    if (!name) {
      throw new BadRequestException(
        'Name is required',
      );
    }

    if (!email) {
      throw new BadRequestException(
        'Email is required',
      );
    }

    if (
      !data.password ||
      data.password.length < 6
    ) {
      throw new BadRequestException(
        'Password must be at least 6 characters',
      );
    }

    const existing =
      await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (existing) {
      throw new BadRequestException(
        'Email is already in use',
      );
    }

    const passwordHash =
      await bcrypt.hash(
        data.password,
        12,
      );

    const displayName =
      surname
        ? `${name} ${surname}`
        : name;

    return this.prisma.user.create({
      data: {
        name:
          displayName,

        surname:
          surname || null,

        email,

        password:
          passwordHash,

        role:
          data.role?.trim() ||
          data.position?.trim() ||
          null,

        position:
          data.position?.trim() ||
          data.role?.trim() ||
          null,

        approvalStatus:
          'APPROVED',

        isActive:
          true,
      },

      select:
        this.userSelect(),
    });
  }

  async update(
    requesterEmail: string,
    id: string,
    data: {
      name?: string;
      surname?: string;
      email?: string;
      role?: string;
      position?: string;
    },
  ) {
    this.assertSuperAdmin(
      requesterEmail,
    );

    const existing =
      await this.ensureUser(
        id,
      );

    this.ensureNotOwnerTarget(
      existing.email,
      requesterEmail,
      'edit',
    );

    let email:
      | string
      | undefined;

    if (
      data.email !== undefined
    ) {
      email =
        data.email
          .trim()
          .toLowerCase();

      if (!email) {
        throw new BadRequestException(
          'Email is required',
        );
      }

      const duplicate =
        await this.prisma.user.findFirst({
          where: {
            email,

            id: {
              not: id,
            },
          },
        });

      if (duplicate) {
        throw new BadRequestException(
          'Email is already in use',
        );
      }
    }

    return this.prisma.user.update({
      where: {
        id,
      },

      data: {
        ...(data.name !==
          undefined && {
          name:
            data.name.trim(),
        }),

        ...(data.surname !==
          undefined && {
          surname:
            data.surname.trim() ||
            null,
        }),

        ...(email !==
          undefined && {
          email,
        }),

        ...(data.role !==
          undefined && {
          role:
            data.role.trim() ||
            null,
        }),

        ...(data.position !==
          undefined && {
          position:
            data.position.trim() ||
            null,
        }),
      },

      select:
        this.userSelect(),
    });
  }

  async approve(
    requesterEmail:
      string,
    id: string,
  ) {
    this.assertSuperAdmin(
      requesterEmail,
    );

    const user =
      await this.ensureUser(
        id,
      );

    if (
      user.approvalStatus ===
      'APPROVED'
    ) {
      return this.findOne(id);
    }

    return this.prisma.user.update({
      where: {
        id,
      },

      data: {
        approvalStatus:
          'APPROVED',

        isActive: true,
      },

      select:
        this.userSelect(),
    });
  }

  async reject(
    requesterEmail:
      string,
    id: string,
  ) {
    this.assertSuperAdmin(
      requesterEmail,
    );

    const user =
      await this.ensureUser(
        id,
      );

    this.ensureNotOwnerTarget(
      user.email,
      requesterEmail,
      'reject',
    );

    return this.prisma.user.update({
      where: {
        id,
      },

      data: {
        approvalStatus:
          'REJECTED',

        isActive: false,
      },

      select:
        this.userSelect(),
    });
  }

  async deactivate(
    requesterEmail:
      string,
    id: string,
  ) {
    this.assertSuperAdmin(
      requesterEmail,
    );

    const user =
      await this.ensureUser(
        id,
      );

    this.ensureNotOwnerTarget(
      user.email,
      requesterEmail,
      'deactivate',
    );

    return this.prisma.user.update({
      where: {
        id,
      },

      data: {
        isActive:
          false,
      },

      select:
        this.userSelect(),
    });
  }

  async reactivate(
    requesterEmail:
      string,
    id: string,
  ) {
    this.assertSuperAdmin(
      requesterEmail,
    );

    const user =
      await this.ensureUser(
        id,
      );

    if (
      user.approvalStatus !==
      'APPROVED'
    ) {
      throw new BadRequestException(
        'Only approved users can be reactivated',
      );
    }

    return this.prisma.user.update({
      where: {
        id,
      },

      data: {
        isActive:
          true,
      },

      select:
        this.userSelect(),
    });
  }

  async resetPassword(
    requesterEmail:
      string,
    id: string,
    password: string,
  ) {
    this.assertSuperAdmin(
      requesterEmail,
    );

    await this.ensureUser(
      id,
    );

    if (
      !password ||
      password.length < 6
    ) {
      throw new BadRequestException(
        'Password must be at least 6 characters',
      );
    }

    const passwordHash =
      await bcrypt.hash(
        password,
        12,
      );

    await this.prisma.user.update({
      where: {
        id,
      },

      data: {
        password:
          passwordHash,
      },
    });

    return {
      success: true,
    };
  }

  private async ensureUser(
    id: string,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id,
        },
      });

    if (!user) {
      throw new NotFoundException(
        'Team member not found',
      );
    }

    return user;
  }

  private assertSuperAdmin(
    requesterEmail:
      string,
  ) {
    if (
      !this.isSuperAdminEmail(
        requesterEmail,
      )
    ) {
      throw new ForbiddenException(
        'Super admin access required',
      );
    }
  }

  private ensureNotOwnerTarget(
    targetEmail: string,
    requesterEmail: string,
    action: string,
  ) {
    if (
      this.isSuperAdminEmail(
        targetEmail,
      )
    ) {
      throw new BadRequestException(
        `Super admin account cannot be ${action}ed`,
      );
    }

    if (
      targetEmail
        .trim()
        .toLowerCase() ===
      requesterEmail
        .trim()
        .toLowerCase() &&
      action ===
        'deactivate'
    ) {
      throw new BadRequestException(
        'You cannot deactivate your own account',
      );
    }
  }

  private isSuperAdminEmail(
    email: string,
  ) {
    const ownerEmail =
      this.configService
        .get<string>(
          'SUPER_ADMIN_EMAIL',
        )
        ?.trim()
        .toLowerCase();

    return (
      !!ownerEmail &&
      email
        .trim()
        .toLowerCase() ===
        ownerEmail
    );
  }

  private userSelect() {
    return {
      id: true,
      name: true,
      surname: true,
      email: true,
      role: true,
      position: true,
      approvalStatus:
        true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    } as const;
  }
}