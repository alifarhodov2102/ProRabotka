import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

type StartupPayload = {
  name?: string;
  founderName?: string | null;
  phone?: string | null;
  email?: string | null;
  stage?: string | null;
  status?: string;
  joinedAt?: string | null;
  notes?: string | null;
  logoUrl?: string | null;
};

type FundingPayload = {
  type?: string;
  amount?: number | string | null;
  currency?: string | null;
  source?: string | null;
  round?: string | null;
  fundedAt?: string | null;
  notes?: string | null;
};

@Injectable()
export class StartupsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll() {
    return this.prisma.startup.findMany({
      orderBy: {
        createdAt: 'desc',
      },

      include: {
        funding: {
          orderBy: {
            fundedAt: 'desc',
          },
        },

        documents: {
          orderBy: {
            createdAt: 'desc',
          },
        },

        _count: {
          select: {
            tasks: true,
            documents: true,
          },
        },
      },
    });
  }

  async findOne(
    id: string,
  ) {
    const startup =
      await this.prisma.startup.findUnique({
        where: {
          id,
        },

        include: {
          funding: {
            orderBy: [
              {
                fundedAt:
                  'desc',
              },
              {
                createdAt:
                  'desc',
              },
            ],
          },

          documents: {
            orderBy: {
              createdAt:
                'desc',
            },

            include: {
              uploadedBy: {
                select: {
                  id: true,
                  name: true,
                  surname: true,
                },
              },
            },
          },

          tasks: {
            orderBy: {
              createdAt:
                'desc',
            },

            include: {
              assignee: {
                select: {
                  id: true,
                  name: true,
                  position: true,
                },
              },

              creator: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },

          _count: {
            select: {
              tasks: true,
              documents: true,
            },
          },
        },
      });

    if (!startup) {
      throw new NotFoundException(
        'Startup not found',
      );
    }

    return startup;
  }

  async create(
    data: StartupPayload,
  ) {
    const name =
      data.name?.trim();

    if (!name) {
      throw new BadRequestException(
        'Startup name is required',
      );
    }

    return this.prisma.startup.create({
      data: {
        name,

        founderName:
          this.cleanOptional(
            data.founderName,
          ),

        phone:
          this.cleanOptional(
            data.phone,
          ),

        email:
          this.cleanOptional(
            data.email,
          ),

        stage:
          this.cleanOptional(
            data.stage,
          ),

        status:
          this.normalizeStartupStatus(
            data.status,
          ),

        joinedAt:
          this.parseOptionalDate(
            data.joinedAt,
            'Joined date',
          ),

        notes:
          this.cleanOptional(
            data.notes,
          ),

        logoUrl:
          this.cleanOptional(
            data.logoUrl,
          ),
      },

      include: {
        funding: true,
        documents: true,
      },
    });
  }

  async update(
    id: string,
    data: StartupPayload,
  ) {
    await this.ensureStartup(
      id,
    );

    const updateData: any = {};

    if (
      data.name !==
      undefined
    ) {
      const name =
        data.name.trim();

      if (!name) {
        throw new BadRequestException(
          'Startup name is required',
        );
      }

      updateData.name =
        name;
    }

    if (
      data.founderName !==
      undefined
    ) {
      updateData.founderName =
        this.cleanOptional(
          data.founderName,
        );
    }

    if (
      data.phone !==
      undefined
    ) {
      updateData.phone =
        this.cleanOptional(
          data.phone,
        );
    }

    if (
      data.email !==
      undefined
    ) {
      updateData.email =
        this.cleanOptional(
          data.email,
        );
    }

    if (
      data.stage !==
      undefined
    ) {
      updateData.stage =
        this.cleanOptional(
          data.stage,
        );
    }

    if (
      data.status !==
      undefined
    ) {
      updateData.status =
        this.normalizeStartupStatus(
          data.status,
        );
    }

    if (
      data.joinedAt !==
      undefined
    ) {
      updateData.joinedAt =
        this.parseOptionalDate(
          data.joinedAt,
          'Joined date',
        );
    }

    if (
      data.notes !==
      undefined
    ) {
      updateData.notes =
        this.cleanOptional(
          data.notes,
        );
    }

    if (
      data.logoUrl !==
      undefined
    ) {
      updateData.logoUrl =
        this.cleanOptional(
          data.logoUrl,
        );
    }

    return this.prisma.startup.update({
      where: {
        id,
      },

      data: updateData,

      include: {
        funding: {
          orderBy: {
            fundedAt:
              'desc',
          },
        },

        documents: {
          orderBy: {
            createdAt:
              'desc',
          },
        },

        _count: {
          select: {
            tasks: true,
            documents: true,
          },
        },
      },
    });
  }

  async updateLogo(
    id: string,
    logoUrl: string,
  ) {
    await this.ensureStartup(
      id,
    );

    return this.prisma.startup.update({
      where: {
        id,
      },

      data: {
        logoUrl,
      },

      include: {
        funding: {
          orderBy: {
            fundedAt:
              'desc',
          },
        },

        documents: {
          orderBy: {
            createdAt:
              'desc',
          },
        },

        _count: {
          select: {
            tasks: true,
            documents: true,
          },
        },
      },
    });
  }

  async archive(
    id: string,
  ) {
    await this.ensureStartup(
      id,
    );

    return this.prisma.startup.update({
      where: {
        id,
      },

      data: {
        status:
          'ARCHIVED',
      },

      include: {
        funding: true,
        documents: true,
      },
    });
  }

  async remove(
    id: string,
  ) {
    await this.ensureStartup(
      id,
    );

    await this.prisma.startup.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
    };
  }

  async addFunding(
    startupId: string,
    data: FundingPayload,
  ) {
    await this.ensureStartup(
      startupId,
    );

    const type =
      this.normalizeFundingType(
        data.type,
      );

    return this.prisma.startupFunding.create({
      data: {
        startupId,

        type,

        amount:
          this.parseOptionalAmount(
            data.amount,
          ),

        currency:
          this.cleanOptional(
            data.currency,
          ),

        source:
          this.cleanOptional(
            data.source,
          ),

        round:
          this.cleanOptional(
            data.round,
          ),

        fundedAt:
          this.parseOptionalDate(
            data.fundedAt,
            'Funding date',
          ),

        notes:
          this.cleanOptional(
            data.notes,
          ),
      },
    });
  }

  async updateFunding(
    startupId: string,
    fundingId: string,
    data: FundingPayload,
  ) {
    await this.ensureStartup(
      startupId,
    );

    const funding =
      await this.prisma.startupFunding.findFirst({
        where: {
          id: fundingId,
          startupId,
        },
      });

    if (!funding) {
      throw new NotFoundException(
        'Funding record not found',
      );
    }

    const updateData: any = {};

    if (
      data.type !==
      undefined
    ) {
      updateData.type =
        this.normalizeFundingType(
          data.type,
        );
    }

    if (
      data.amount !==
      undefined
    ) {
      updateData.amount =
        this.parseOptionalAmount(
          data.amount,
        );
    }

    if (
      data.currency !==
      undefined
    ) {
      updateData.currency =
        this.cleanOptional(
          data.currency,
        );
    }

    if (
      data.source !==
      undefined
    ) {
      updateData.source =
        this.cleanOptional(
          data.source,
        );
    }

    if (
      data.round !==
      undefined
    ) {
      updateData.round =
        this.cleanOptional(
          data.round,
        );
    }

    if (
      data.fundedAt !==
      undefined
    ) {
      updateData.fundedAt =
        this.parseOptionalDate(
          data.fundedAt,
          'Funding date',
        );
    }

    if (
      data.notes !==
      undefined
    ) {
      updateData.notes =
        this.cleanOptional(
          data.notes,
        );
    }

    return this.prisma.startupFunding.update({
      where: {
        id: fundingId,
      },

      data: updateData,
    });
  }

  async removeFunding(
    startupId: string,
    fundingId: string,
  ) {
    await this.ensureStartup(
      startupId,
    );

    const funding =
      await this.prisma.startupFunding.findFirst({
        where: {
          id: fundingId,
          startupId,
        },
      });

    if (!funding) {
      throw new NotFoundException(
        'Funding record not found',
      );
    }

    await this.prisma.startupFunding.delete({
      where: {
        id: fundingId,
      },
    });

    return {
      success: true,
    };
  }

  private async ensureStartup(
    id: string,
  ) {
    const startup =
      await this.prisma.startup.findUnique({
        where: {
          id,
        },

        select: {
          id: true,
        },
      });

    if (!startup) {
      throw new NotFoundException(
        'Startup not found',
      );
    }

    return startup;
  }

  private normalizeStartupStatus(
    value?: string,
  ):
    | 'ACTIVE'
    | 'PAUSED'
    | 'COMPLETED'
    | 'ARCHIVED' {
    const status =
      value
        ?.trim()
        .toUpperCase() ||
      'ACTIVE';

    const allowed = [
      'ACTIVE',
      'PAUSED',
      'COMPLETED',
      'ARCHIVED',
    ] as const;

    if (
      !allowed.includes(
        status as
          (typeof allowed)[number],
      )
    ) {
      throw new BadRequestException(
        'Invalid startup status',
      );
    }

    return status as
      | 'ACTIVE'
      | 'PAUSED'
      | 'COMPLETED'
      | 'ARCHIVED';
  }

  private normalizeFundingType(
    value?: string,
  ):
    | 'INVESTMENT'
    | 'GRANT' {
    const type =
      value
        ?.trim()
        .toUpperCase();

    if (
      type !==
        'INVESTMENT' &&
      type !==
        'GRANT'
    ) {
      throw new BadRequestException(
        'Funding type must be INVESTMENT or GRANT',
      );
    }

    return type;
  }

  private parseOptionalAmount(
    value:
      | number
      | string
      | null
      | undefined,
  ) {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return null;
    }

    const amount =
      Number(value);

    if (
      !Number.isFinite(
        amount,
      ) ||
      amount < 0
    ) {
      throw new BadRequestException(
        'Funding amount must be a valid positive number',
      );
    }

    return amount;
  }

  private parseOptionalDate(
    value:
      | string
      | null
      | undefined,
    label: string,
  ) {
    if (!value) {
      return null;
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      throw new BadRequestException(
        `${label} is invalid`,
      );
    }

    return date;
  }

  private cleanOptional(
    value:
      | string
      | null
      | undefined,
  ) {
    if (
      value === null ||
      value === undefined
    ) {
      return null;
    }

    const cleaned =
      value.trim();

    return cleaned ||
      null;
  }
}