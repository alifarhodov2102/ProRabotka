import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import ExcelJS from 'exceljs';

import { PrismaService } from '../prisma/prisma.service.js';

type ResidentInput = {
  companyName: string;
  tin?: string | null;
  activity?: string | null;
  exporter?: boolean;
  founderCountry?: string | null;
  region?: string | null;
  district?: string | null;
  residentSince?: string | null;
  focalPoint?: string | null;
  broughtBy?: string | null;
  status?:
    | 'ACTIVE'
    | 'INACTIVE'
    | 'SUSPENDED'
    | 'ARCHIVED';
  notes?: string | null;
};

type ApplicationInput = {
  companyName?: string;
  tin?: string | null;
  activity?: string | null;
  exporter?: boolean;
  founderCountry?: string | null;
  region?: string | null;
  district?: string | null;
  appliedAt?: string | null;
  focalPoint?: string | null;
  broughtBy?: string | null;
  status?:
    | 'PENDING'
    | 'REJECTED'
    | 'APPROVED';
  notes?: string | null;
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
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll() {
    return this.prisma.resident.findMany({
      include: {
        quarterReports: {
          orderBy: [
            {
              year:
                'desc',
            },
            {
              quarter:
                'asc',
            },
          ],
        },
      },

      orderBy: {
        createdAt:
          'asc',
      },
    });
  }

  async findApplications() {
    return this.prisma.residentApplication.findMany({
      where: {
        status: {
          not:
            'APPROVED',
        },
      },

      orderBy: {
        createdAt:
          'asc',
      },
    });
  }

  async findOne(
    id: string,
  ) {
    const resident =
      await this.prisma.resident.findUnique({
        where: {
          id,
        },

        include: {
          quarterReports: {
            orderBy: [
              {
                year:
                  'desc',
              },
              {
                quarter:
                  'asc',
              },
            ],
          },

          infrastructure:
            true,

          documents: {
            orderBy: {
              createdAt:
                'desc',
            },
          },

          tasks: {
            orderBy: {
              createdAt:
                'desc',
            },
          },
        },
      });

    if (!resident) {
      throw new NotFoundException(
        'Resident not found',
      );
    }

    return resident;
  }

  async create(
    data: ResidentInput,
  ) {
    if (
      !data.companyName?.trim()
    ) {
      throw new BadRequestException(
        'Company name is required',
      );
    }

    await this.ensureResidentTinAvailable(
      data.tin,
    );

    return this.prisma.resident.create({
      data: {
        companyName:
          data.companyName.trim(),

        tin:
          this.cleanOptional(
            data.tin,
          ),

        activity:
          this.cleanOptional(
            data.activity,
          ),

        exporter:
          data.exporter ??
          false,

        founderCountry:
          this.cleanOptional(
            data.founderCountry,
          ),

        region:
          this.cleanOptional(
            data.region,
          ),

        district:
          this.cleanOptional(
            data.district,
          ),

        residentSince:
          this.parseDate(
            data.residentSince,
          ),

        focalPoint:
          this.cleanOptional(
            data.focalPoint,
          ),

        broughtBy:
          this.cleanOptional(
            data.broughtBy,
          ),

        status:
          data.status ??
          'ACTIVE',

        notes:
          this.cleanOptional(
            data.notes,
          ),
      },
    });
  }

  async update(
    id: string,
    data: Partial<ResidentInput>,
  ) {
    await this.findOne(
      id,
    );

    await this.ensureResidentTinAvailable(
      data.tin,
      id,
    );

    return this.prisma.resident.update({
      where: {
        id,
      },

      data: {
        ...(data.companyName !==
          undefined && {
          companyName:
            data.companyName.trim(),
        }),

        ...(data.tin !==
          undefined && {
          tin:
            this.cleanOptional(
              data.tin,
            ),
        }),

        ...(data.activity !==
          undefined && {
          activity:
            this.cleanOptional(
              data.activity,
            ),
        }),

        ...(data.exporter !==
          undefined && {
          exporter:
            data.exporter,
        }),

        ...(data.founderCountry !==
          undefined && {
          founderCountry:
            this.cleanOptional(
              data.founderCountry,
            ),
        }),

        ...(data.region !==
          undefined && {
          region:
            this.cleanOptional(
              data.region,
            ),
        }),

        ...(data.district !==
          undefined && {
          district:
            this.cleanOptional(
              data.district,
            ),
        }),

        ...(data.residentSince !==
          undefined && {
          residentSince:
            this.parseDate(
              data.residentSince,
            ),
        }),

        ...(data.focalPoint !==
          undefined && {
          focalPoint:
            this.cleanOptional(
              data.focalPoint,
            ),
        }),

        ...(data.broughtBy !==
          undefined && {
          broughtBy:
            this.cleanOptional(
              data.broughtBy,
            ),
        }),

        ...(data.status !==
          undefined && {
          status:
            data.status,
        }),

        ...(data.notes !==
          undefined && {
          notes:
            this.cleanOptional(
              data.notes,
            ),
        }),
      },
    });
  }

  async createApplication(
    data: ApplicationInput,
  ) {
    const companyName =
      data.companyName?.trim();

    if (!companyName) {
      throw new BadRequestException(
        'Company name is required',
      );
    }

    return this.prisma.residentApplication.create({
      data: {
        companyName,

        tin:
          this.cleanOptional(
            data.tin,
          ),

        activity:
          this.cleanOptional(
            data.activity,
          ),

        exporter:
          data.exporter ??
          false,

        founderCountry:
          this.cleanOptional(
            data.founderCountry,
          ),

        region:
          this.cleanOptional(
            data.region,
          ),

        district:
          this.cleanOptional(
            data.district,
          ),

        appliedAt:
          this.parseDate(
            data.appliedAt,
          ) ??
          new Date(),

        focalPoint:
          this.cleanOptional(
            data.focalPoint,
          ),

        broughtBy:
          this.cleanOptional(
            data.broughtBy,
          ),

        status:
          data.status ===
          'REJECTED'
            ? 'REJECTED'
            : 'PENDING',

        notes:
          this.cleanOptional(
            data.notes,
          ),
      },
    });
  }

  async updateApplication(
    id: string,
    data: ApplicationInput,
  ) {
    const application =
      await this.ensureApplication(
        id,
      );

    if (
      data.status ===
      'APPROVED'
    ) {
      return this.approveApplication(
        id,
      );
    }

    return this.prisma.residentApplication.update({
      where: {
        id,
      },

      data: {
        ...(data.companyName !==
          undefined && {
          companyName:
            data.companyName.trim(),
        }),

        ...(data.tin !==
          undefined && {
          tin:
            this.cleanOptional(
              data.tin,
            ),
        }),

        ...(data.activity !==
          undefined && {
          activity:
            this.cleanOptional(
              data.activity,
            ),
        }),

        ...(data.exporter !==
          undefined && {
          exporter:
            data.exporter,
        }),

        ...(data.founderCountry !==
          undefined && {
          founderCountry:
            this.cleanOptional(
              data.founderCountry,
            ),
        }),

        ...(data.region !==
          undefined && {
          region:
            this.cleanOptional(
              data.region,
            ),
        }),

        ...(data.district !==
          undefined && {
          district:
            this.cleanOptional(
              data.district,
            ),
        }),

        ...(data.appliedAt !==
          undefined && {
          appliedAt:
            this.parseDate(
              data.appliedAt,
            ),
        }),

        ...(data.focalPoint !==
          undefined && {
          focalPoint:
            this.cleanOptional(
              data.focalPoint,
            ),
        }),

        ...(data.broughtBy !==
          undefined && {
          broughtBy:
            this.cleanOptional(
              data.broughtBy,
            ),
        }),

        ...(data.status !==
          undefined && {
          status:
            data.status ===
            'REJECTED'
              ? 'REJECTED'
              : 'PENDING',
        }),

        ...(data.notes !==
          undefined && {
          notes:
            this.cleanOptional(
              data.notes,
            ),
        }),
      },
    });
  }

  async approveApplication(
    id: string,
  ) {
    const application =
      await this.ensureApplication(
        id,
      );

    if (
      application.status ===
      'APPROVED'
    ) {
      throw new BadRequestException(
        'Application is already approved',
      );
    }

    await this.ensureResidentTinAvailable(
      application.tin,
    );

    const now =
      new Date();

    return this.prisma.$transaction(
      async (
        transaction,
      ) => {
        const resident =
          await transaction.resident.create({
            data: {
              companyName:
                application.companyName,

              tin:
                application.tin,

              activity:
                application.activity,

              exporter:
                application.exporter,

              founderCountry:
                application.founderCountry,

              region:
                application.region,

              district:
                application.district,

              residentSince:
                now,

              focalPoint:
                application.focalPoint,

              broughtBy:
                application.broughtBy,

              status:
                'ACTIVE',

              notes:
                application.notes,
            },
          });

        const approvedApplication =
          await transaction.residentApplication.update({
            where: {
              id,
            },

            data: {
              status:
                'APPROVED',

              approvedAt:
                now,
            },
          });

        return {
          resident,
          application:
            approvedApplication,
        };
      },
    );
  }

  async removeApplication(
    id: string,
  ) {
    await this.ensureApplication(
      id,
    );

    await this.prisma.residentApplication.delete({
      where: {
        id,
      },
    });

    return {
      success:
        true,
    };
  }

  async remove(
    id: string,
  ) {
    const resident =
      await this.prisma.resident.findUnique({
        where: {
          id,
        },

        include: {
          _count: {
            select: {
              documents:
                true,

              tasks:
                true,

              infrastructure:
                true,
            },
          },
        },
      });

    if (!resident) {
      throw new NotFoundException(
        'Resident not found',
      );
    }

    const hasLinkedData =
      resident._count.documents >
        0 ||
      resident._count.tasks >
        0 ||
      resident._count.infrastructure >
        0;

    if (hasLinkedData) {
      throw new BadRequestException(
        'This resident has linked data. Change its status instead of deleting it.',
      );
    }

    await this.prisma.resident.delete({
      where: {
        id,
      },
    });

    return {
      success:
        true,
    };
  }

  async archive(
    id: string,
  ) {
    await this.findOne(
      id,
    );

    return this.prisma.resident.update({
      where: {
        id,
      },

      data: {
        status:
          'ARCHIVED',
      },
    });
  }

  async setQuarterReport(
    residentId: string,
    year: number,
    quarter: number,
    data: QuarterInput,
  ) {
    await this.findOne(
      residentId,
    );

    if (
      quarter <
        1 ||
      quarter >
        4
    ) {
      throw new BadRequestException(
        'Quarter must be between 1 and 4',
      );
    }

    const now =
      new Date();

    return this.prisma.quarterReport.upsert({
      where: {
        residentId_year_quarter: {
          residentId,
          year,
          quarter,
        },
      },

      update: {
        status:
          data.status,

        notes:
          data.notes?.trim() ||
          null,

        receivedAt:
          data.status ===
            'RECEIVED' ||
          data.status ===
            'CHECKED'
            ? now
            : null,

        checkedAt:
          data.status ===
          'CHECKED'
            ? now
            : null,
      },

      create: {
        residentId,
        year,
        quarter,

        status:
          data.status,

        notes:
          data.notes?.trim() ||
          null,

        receivedAt:
          data.status ===
            'RECEIVED' ||
          data.status ===
            'CHECKED'
            ? now
            : null,

        checkedAt:
          data.status ===
          'CHECKED'
            ? now
            : null,
      },
    });
  }

  async exportExcel() {
    const [
      residents,
      applications,
    ] =
      await Promise.all([
        this.prisma.resident.findMany({
          orderBy: {
            createdAt:
              'asc',
          },
        }),

        this.prisma.residentApplication.findMany({
          where: {
            status: {
              not:
                'APPROVED',
            },
          },

          orderBy: {
            createdAt:
              'asc',
          },
        }),
      ]);

    const workbook =
      new ExcelJS.Workbook();

    workbook.creator =
      'ProRabotka';

    workbook.created =
      new Date();

    const residentsSheet =
      workbook.addWorksheet(
        'Residents',
      );

    const applicationsSheet =
      workbook.addWorksheet(
        'Becoming residents',
      );

    this.prepareWorksheet(
      residentsSheet,
      'Sirdaryo viloyati IT-Park rezidentlari',
      "Rezident bo'lgan sana",
    );

    this.prepareWorksheet(
      applicationsSheet,
      'Sirdaryo viloyati IT-Park rezidentligiga ariza topshirganlar',
      'Ariza sanasi',
    );

    residents.forEach(
      (
        resident,
        index,
      ) => {
        const row =
          residentsSheet.addRow({
            number:
              index +
              1,

            companyName:
              resident.companyName,

            tin:
              resident.tin ||
              '',

            activity:
              resident.activity ||
              '',

            exporter:
              resident.exporter
                ? 1
                : '',

            founderCountry:
              resident.founderCountry ||
              '',

            district:
              resident.district ||
              resident.region ||
              '',

            date:
              resident.residentSince ||
              '',

            focalPoint:
              resident.focalPoint ||
              '',

            status:
              this.residentStatusLabel(
                resident.status,
              ),
          });

        this.styleDataRow(
          row,
          resident.founderCountry,
          resident.status ===
          'ACTIVE'
            ? 'green'
            : 'red',
        );
      },
    );

    applications.forEach(
      (
        application,
        index,
      ) => {
        const row =
          applicationsSheet.addRow({
            number:
              index +
              1,

            companyName:
              application.companyName,

            tin:
              application.tin ||
              '',

            activity:
              application.activity ||
              '',

            exporter:
              application.exporter
                ? 1
                : '',

            founderCountry:
              application.founderCountry ||
              '',

            district:
              application.district ||
              application.region ||
              '',

            date:
              application.appliedAt ||
              '',

            focalPoint:
              application.focalPoint ||
              '',

            status:
              this.applicationStatusLabel(
                application.status,
              ),
          });

        this.styleDataRow(
          row,
          application.founderCountry,
          application.status ===
          'PENDING'
            ? 'amber'
            : 'red',
        );
      },
    );

    this.finishWorksheet(
      residentsSheet,
    );

    this.finishWorksheet(
      applicationsSheet,
    );

    const buffer =
      await workbook.xlsx.writeBuffer();

    return Buffer.from(
      buffer,
    );
  }

  private prepareWorksheet(
    worksheet: ExcelJS.Worksheet,
    title: string,
    dateHeader: string,
  ) {
    worksheet.mergeCells(
      'A1:J1',
    );

    const titleCell =
      worksheet.getCell(
        'A1',
      );

    titleCell.value =
      title;

    titleCell.font = {
      name:
        'Times New Roman',

      size:
        14,

      bold:
        true,
    };

    titleCell.alignment = {
      horizontal:
        'center',

      vertical:
        'middle',
    };

    worksheet.getRow(
      1,
    ).height =
      24;

    worksheet.getRow(
      2,
    ).height =
      8;

    worksheet.columns = [
      {
        key:
          'number',

        width:
          8,
      },
      {
        key:
          'companyName',

        width:
          38,
      },
      {
        key:
          'tin',

        width:
          14,
      },
      {
        key:
          'activity',

        width:
          23,
      },
      {
        key:
          'exporter',

        width:
          12,
      },
      {
        key:
          'founderCountry',

        width:
          20,
      },
      {
        key:
          'district',

        width:
          21,
      },
      {
        key:
          'date',

        width:
          20,
      },
      {
        key:
          'focalPoint',

        width:
          26,
      },
      {
        key:
          'status',

        width:
          18,
      },
    ];

    const headerRow =
      worksheet.getRow(
        3,
      );

    headerRow.values = [
      'T/r',
      'Nomi',
      'STIR',
      'Faoliyat turi',
      'Eksportyor',
      "Ta'sischi davlat",
      'Hudud',
      dateHeader,
      'FOCAL POINT',
      'HOLATI',
    ];

    headerRow.height =
      27;

    headerRow.eachCell(
      (
        cell,
      ) => {
        cell.font = {
          name:
            'Times New Roman',

          size:
            11,

          bold:
            true,

          color: {
            argb:
              'FFFFFFFF',
          },
        };

        cell.fill = {
          type:
            'pattern',

          pattern:
            'solid',

          fgColor: {
            argb:
              'FF356B5A',
          },
        };

        cell.alignment = {
          horizontal:
            'center',

          vertical:
            'middle',

          wrapText:
            true,
        };

        cell.border =
          this.excelBorder();
      },
    );

    worksheet.views = [
      {
        state:
          'frozen',

        ySplit:
          3,
      },
    ];

    worksheet.getColumn(
      3,
    ).numFmt =
      '@';
  }

  private styleDataRow(
    row: ExcelJS.Row,
    founderCountry:
      string | null,
    statusColor:
      | 'green'
      | 'amber'
      | 'red',
  ) {
    row.height =
      28;

    row.eachCell(
      {
        includeEmpty:
          true,
      },

      (
        cell,
      ) => {
        cell.font = {
          name:
            'Times New Roman',

          size:
            11,
        };

        cell.alignment = {
          horizontal:
            'center',

          vertical:
            'middle',

          wrapText:
            true,
        };

        cell.border =
          this.excelBorder();
      },
    );

    const countryCell =
      row.getCell(
        6,
      );

    if (founderCountry) {
      const normalized =
        founderCountry
          .trim()
          .toLowerCase();

      const uzbekistan =
        normalized.includes(
          "o'zbekiston",
        ) ||
        normalized.includes(
          'uzbekistan',
        );

      countryCell.fill = {
        type:
          'pattern',

        pattern:
          'solid',

        fgColor: {
          argb:
            uzbekistan
              ? 'FFFFFF00'
              : 'FF92D050',
        },
      };
    }

    const dateCell =
      row.getCell(
        8,
      );

    if (
      dateCell.value instanceof
      Date
    ) {
      dateCell.numFmt =
        'dd/mm/yy';
    }

    const statusCell =
      row.getCell(
        10,
      );

    const color =
      statusColor ===
      'green'
        ? 'FF15803D'
        : statusColor ===
            'amber'
          ? 'FFD97706'
          : 'FFC00000';

    statusCell.font = {
      name:
        'Times New Roman',

      size:
        10,

      bold:
        true,

      color: {
        argb:
          'FFFFFFFF',
      },
    };

    statusCell.fill = {
      type:
        'pattern',

      pattern:
        'solid',

      fgColor: {
        argb:
          color,
      },
    };
  }

  private finishWorksheet(
    worksheet: ExcelJS.Worksheet,
  ) {
    worksheet.autoFilter = {
      from:
        'A3',

      to:
        `J${Math.max(
          worksheet.rowCount,
          3,
        )}`,
    };

    worksheet.pageSetup = {
      orientation:
        'landscape',

      fitToPage:
        true,

      fitToWidth:
        1,

      fitToHeight:
        0,

      paperSize:
        9,
    };
  }

  private async ensureApplication(
    id: string,
  ) {
    const application =
      await this.prisma.residentApplication.findUnique({
        where: {
          id,
        },
      });

    if (!application) {
      throw new NotFoundException(
        'Resident application not found',
      );
    }

    return application;
  }

  private async ensureResidentTinAvailable(
    tin:
      | string
      | null
      | undefined,
    excludeId?:
      string,
  ) {
    const cleanTin =
      this.cleanOptional(
        tin,
      );

    if (!cleanTin) {
      return;
    }

    const duplicate =
      await this.prisma.resident.findFirst({
        where: {
          tin:
            cleanTin,

          ...(excludeId
            ? {
                NOT: {
                  id:
                    excludeId,
                },
              }
            : {}),
        },
      });

    if (duplicate) {
      throw new BadRequestException(
        'Resident with this STIR already exists',
      );
    }
  }

  private parseDate(
    value:
      | string
      | null
      | undefined,
  ) {
    if (!value) {
      return null;
    }

    const date =
      new Date(
        value,
      );

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      throw new BadRequestException(
        'Invalid date',
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
      value ===
        null ||
      value ===
        undefined
    ) {
      return null;
    }

    const cleaned =
      value.trim();

    return cleaned ||
      null;
  }

  private residentStatusLabel(
    status:
      string,
  ) {
    if (
      status ===
      'ACTIVE'
    ) {
      return 'FAOL';
    }

    if (
      status ===
      'SUSPENDED'
    ) {
      return "TO'XTATILGAN";
    }

    return 'FAOL EMAS';
  }

  private applicationStatusLabel(
    status:
      string,
  ) {
    if (
      status ===
      'PENDING'
    ) {
      return 'PENDING';
    }

    if (
      status ===
      'REJECTED'
    ) {
      return 'REJECTED';
    }

    return 'APPROVED';
  }

  private excelBorder() {
    const side = {
      style:
        'thin' as const,

      color: {
        argb:
          'FF808080',
      },
    };

    return {
      top:
        side,

      left:
        side,

      bottom:
        side,

      right:
        side,
    };
  }
}
