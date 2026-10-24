import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import ExcelJS from 'exceljs';

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
  constructor(
    private readonly prisma: PrismaService,
  ) {}

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
        createdAt: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const resident =
      await this.prisma.resident.findUnique({
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
      throw new NotFoundException(
        'Resident not found',
      );
    }

    return resident;
  }

  async create(data: ResidentInput) {
    if (!data.companyName?.trim()) {
      throw new BadRequestException(
        'Company name is required',
      );
    }

    if (data.tin) {
      const existing =
        await this.prisma.resident.findUnique({
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
        companyName:
          data.companyName.trim(),

        tin:
          data.tin?.trim() ||
          null,

        activity:
          data.activity?.trim() ||
          null,

        exporter:
          data.exporter ??
          false,

        founderCountry:
          data.founderCountry?.trim() ||
          null,

        region:
          data.region?.trim() ||
          null,

        district:
          data.district?.trim() ||
          null,

        residentSince:
          data.residentSince
            ? new Date(
                data.residentSince,
              )
            : null,

        focalPoint:
          data.focalPoint?.trim() ||
          null,

        broughtBy:
          data.broughtBy?.trim() ||
          null,

        status:
          data.status ??
          'ACTIVE',

        notes:
          data.notes?.trim() ||
          null,
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

    if (data.tin) {
      const duplicate =
        await this.prisma.resident.findFirst({
          where: {
            tin:
              data.tin.trim(),

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
        ...(data.companyName !==
          undefined && {
          companyName:
            data.companyName.trim(),
        }),

        ...(data.tin !==
          undefined && {
          tin:
            data.tin.trim() ||
            null,
        }),

        ...(data.activity !==
          undefined && {
          activity:
            data.activity.trim() ||
            null,
        }),

        ...(data.exporter !==
          undefined && {
          exporter:
            data.exporter,
        }),

        ...(data.founderCountry !==
          undefined && {
          founderCountry:
            data.founderCountry.trim() ||
            null,
        }),

        ...(data.region !==
          undefined && {
          region:
            data.region.trim() ||
            null,
        }),

        ...(data.district !==
          undefined && {
          district:
            data.district.trim() ||
            null,
        }),

        ...(data.residentSince !==
          undefined && {
          residentSince:
            data.residentSince
              ? new Date(
                  data.residentSince,
                )
              : null,
        }),

        ...(data.focalPoint !==
          undefined && {
          focalPoint:
            data.focalPoint.trim() ||
            null,
        }),

        ...(data.broughtBy !==
          undefined && {
          broughtBy:
            data.broughtBy.trim() ||
            null,
        }),

        ...(data.status !==
          undefined && {
          status:
            data.status,
        }),

        ...(data.notes !==
          undefined && {
          notes:
            data.notes.trim() ||
            null,
        }),
      },
    });
  }

  async remove(id: string) {
    const resident =
      await this.prisma.resident.findUnique({
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
    await this.findOne(
      id,
    );

    return this.prisma.resident.update({
      where: { id },

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
    const residents =
      await this.prisma.resident.findMany({
        orderBy: [
          {
            residentSince:
              'asc',
          },
          {
            companyName:
              'asc',
          },
        ],
      });

    const workbook =
      new ExcelJS.Workbook();

    workbook.creator =
      'ProRabotka';

    workbook.created =
      new Date();

    const worksheet =
      workbook.addWorksheet(
        'Rezidentlar',
        {
          views: [
            {
              state:
                'frozen',

              ySplit:
                3,
            },
          ],
        },
      );

    worksheet.mergeCells(
      'A1:J1',
    );

    const titleCell =
      worksheet.getCell(
        'A1',
      );

    titleCell.value =
      'Sirdaryo viloyati IT-Park rezidentlari';

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

    const headers = [
      'T/r',
      'Nomi',
      'STIR',
      'Faoliyat turi',
      'Exportyor',
      "Ta'sischi davlat",
      'Hudud',
      "Rezident bo'lgan sana",
      'FOCAL POINT',
      'HOLATI',
    ];

    const headerRow =
      worksheet.getRow(
        3,
      );

    headerRow.values =
      headers;

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
          'residentSince',

        width:
          20,
      },
      {
        key:
          'focalPoint',

        width:
          24,
      },
      {
        key:
          'status',

        width:
          17,
      },
    ];

    residents.forEach(
      (
        resident,
        index,
      ) => {
        const row =
          worksheet.addRow({
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

            residentSince:
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

        row.getCell(
          2,
        ).alignment = {
          horizontal:
            'center',

          vertical:
            'middle',

          wrapText:
            true,
        };

        const countryCell =
          row.getCell(
            6,
          );

        if (
          resident.founderCountry
        ) {
          const uzbekistan =
            resident.founderCountry
              .trim()
              .toLowerCase()
              .includes(
                "o'zbekiston",
              ) ||
            resident.founderCountry
              .trim()
              .toLowerCase()
              .includes(
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
          resident.residentSince
        ) {
          dateCell.value =
            resident.residentSince;

          dateCell.numFmt =
            'dd/mm/yy';
        }

        const statusCell =
          row.getCell(
            10,
          );

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
              resident.status ===
              'ACTIVE'
                ? 'FF15803D'
                : 'FFC00000',
          },
        };

        statusCell.alignment = {
          horizontal:
            'center',

          vertical:
            'middle',
        };
      },
    );

    const lastRow =
      Math.max(
        worksheet.rowCount,
        3,
      );

    worksheet.autoFilter = {
      from:
        'A3',

      to:
        `J${lastRow}`,
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

      margins: {
        left:
          0.25,

        right:
          0.25,

        top:
          0.5,

        bottom:
          0.5,

        header:
          0.2,

        footer:
          0.2,
      },
    };

    worksheet.getColumn(
      3,
    ).numFmt =
      '@';

    const buffer =
      await workbook.xlsx.writeBuffer();

    return Buffer.from(
      buffer,
    );
  }

  private residentStatusLabel(
    status: string,
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
