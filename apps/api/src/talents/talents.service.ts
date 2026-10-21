import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import ExcelJS from 'exceljs';

import {
  PrismaService,
} from '../prisma/prisma.service.js';

type TalentPayload = {
  fullName?: string;

  position?: string | null;

  phone?: string | null;
  email?: string | null;
  telegram?: string | null;

  location?: string | null;

  currentCompany?:
    | string
    | null;

  experienceYears?:
    | number
    | string
    | null;

  salaryExpectation?:
    | number
    | string
    | null;

  salaryCurrency?:
    | string
    | null;

  status?: string;

  linkedinUrl?:
    | string
    | null;

  githubUrl?:
    | string
    | null;

  portfolioUrl?:
    | string
    | null;

  photoUrl?:
    | string
    | null;

  notes?:
    | string
    | null;
};

type SkillPayload = {
  name?: string;
};

type LanguagePayload = {
  language?: string;
  level?: string;
};

@Injectable()
export class TalentsService {
  constructor(
    private readonly prisma:
      PrismaService,
  ) {}

  async findAll() {
    return this.prisma.talent.findMany({
      orderBy: {
        createdAt:
          'desc',
      },

      include: {
        skills: {
          orderBy: {
            name:
              'asc',
          },
        },

        languages: {
          orderBy: {
            language:
              'asc',
          },
        },

        _count: {
          select: {
            documents:
              true,
          },
        },
      },
    });
  }

  async findOne(
    id: string,
  ) {
    const talent =
      await this.prisma.talent.findUnique({
        where: {
          id,
        },

        include: {
          skills: {
            orderBy: {
              name:
                'asc',
            },
          },

          languages: {
            orderBy: {
              language:
                'asc',
            },
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

          _count: {
            select: {
              documents:
                true,
            },
          },
        },
      });

    if (!talent) {
      throw new NotFoundException(
        'Talent not found',
      );
    }

    return talent;
  }

  async create(
    data:
      TalentPayload,
  ) {
    const fullName =
      data.fullName
        ?.trim();

    if (!fullName) {
      throw new BadRequestException(
        'Full name is required',
      );
    }

    return this.prisma.talent.create({
      data: {
        fullName,

        position:
          this.cleanOptional(
            data.position,
          ),

        phone:
          this.cleanOptional(
            data.phone,
          ),

        email:
          this.cleanOptional(
            data.email,
          ),

        telegram:
          this.cleanOptional(
            data.telegram,
          ),

        location:
          this.cleanOptional(
            data.location,
          ),

        currentCompany:
          this.cleanOptional(
            data.currentCompany,
          ),

        experienceYears:
          this.parseExperienceYears(
            data.experienceYears,
          ),

        salaryExpectation:
          this.parseOptionalAmount(
            data.salaryExpectation,
            'Salary expectation',
          ),

        salaryCurrency:
          this.cleanOptional(
            data.salaryCurrency,
          ),

        status:
          this.normalizeStatus(
            data.status,
          ),

        linkedinUrl:
          this.cleanOptional(
            data.linkedinUrl,
          ),

        githubUrl:
          this.cleanOptional(
            data.githubUrl,
          ),

        portfolioUrl:
          this.cleanOptional(
            data.portfolioUrl,
          ),

        photoUrl:
          this.cleanOptional(
            data.photoUrl,
          ),

        notes:
          this.cleanOptional(
            data.notes,
          ),
      },

      include: {
        skills: true,
        languages: true,
        documents: true,
      },
    });
  }

  async update(
    id: string,
    data:
      TalentPayload,
  ) {
    await this.ensureTalent(
      id,
    );

    const updateData:
      Record<
        string,
        any
      > = {};

    if (
      data.fullName !==
      undefined
    ) {
      const fullName =
        data.fullName.trim();

      if (!fullName) {
        throw new BadRequestException(
          'Full name is required',
        );
      }

      updateData.fullName =
        fullName;
    }

    if (
      data.position !==
      undefined
    ) {
      updateData.position =
        this.cleanOptional(
          data.position,
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
      data.telegram !==
      undefined
    ) {
      updateData.telegram =
        this.cleanOptional(
          data.telegram,
        );
    }

    if (
      data.location !==
      undefined
    ) {
      updateData.location =
        this.cleanOptional(
          data.location,
        );
    }

    if (
      data.currentCompany !==
      undefined
    ) {
      updateData.currentCompany =
        this.cleanOptional(
          data.currentCompany,
        );
    }

    if (
      data.experienceYears !==
      undefined
    ) {
      updateData.experienceYears =
        this.parseExperienceYears(
          data.experienceYears,
        );
    }

    if (
      data.salaryExpectation !==
      undefined
    ) {
      updateData.salaryExpectation =
        this.parseOptionalAmount(
          data.salaryExpectation,
          'Salary expectation',
        );
    }

    if (
      data.salaryCurrency !==
      undefined
    ) {
      updateData.salaryCurrency =
        this.cleanOptional(
          data.salaryCurrency,
        );
    }

    if (
      data.status !==
      undefined
    ) {
      updateData.status =
        this.normalizeStatus(
          data.status,
        );
    }

    if (
      data.linkedinUrl !==
      undefined
    ) {
      updateData.linkedinUrl =
        this.cleanOptional(
          data.linkedinUrl,
        );
    }

    if (
      data.githubUrl !==
      undefined
    ) {
      updateData.githubUrl =
        this.cleanOptional(
          data.githubUrl,
        );
    }

    if (
      data.portfolioUrl !==
      undefined
    ) {
      updateData.portfolioUrl =
        this.cleanOptional(
          data.portfolioUrl,
        );
    }

    if (
      data.photoUrl !==
      undefined
    ) {
      updateData.photoUrl =
        this.cleanOptional(
          data.photoUrl,
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

    return this.prisma.talent.update({
      where: {
        id,
      },

      data:
        updateData,

      include: {
        skills: {
          orderBy: {
            name:
              'asc',
          },
        },

        languages: {
          orderBy: {
            language:
              'asc',
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
            documents:
              true,
          },
        },
      },
    });
  }

  async updatePhoto(
    id: string,
    photoUrl: string,
  ) {
    await this.ensureTalent(
      id,
    );

    return this.prisma.talent.update({
      where: {
        id,
      },

      data: {
        photoUrl,
      },

      include: {
        skills: true,
        languages: true,

        _count: {
          select: {
            documents:
              true,
          },
        },
      },
    });
  }

  async remove(
    id: string,
  ) {
    await this.ensureTalent(
      id,
    );

    await this.prisma.talent.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
    };
  }

  async addSkill(
    talentId: string,
    data:
      SkillPayload,
  ) {
    await this.ensureTalent(
      talentId,
    );

    const name =
      data.name
        ?.trim();

    if (!name) {
      throw new BadRequestException(
        'Skill name is required',
      );
    }

    const existing =
      await this.prisma.talentSkill.findFirst({
        where: {
          talentId,

          name: {
            equals:
              name,

            mode:
              'insensitive',
          },
        },
      });

    if (existing) {
      throw new BadRequestException(
        'This skill is already added',
      );
    }

    return this.prisma.talentSkill.create({
      data: {
        talentId,
        name,
      },
    });
  }

  async removeSkill(
    talentId: string,
    skillId: string,
  ) {
    await this.ensureTalent(
      talentId,
    );

    const skill =
      await this.prisma.talentSkill.findFirst({
        where: {
          id:
            skillId,

          talentId,
        },
      });

    if (!skill) {
      throw new NotFoundException(
        'Skill not found',
      );
    }

    await this.prisma.talentSkill.delete({
      where: {
        id:
          skillId,
      },
    });

    return {
      success: true,
    };
  }

  async addLanguage(
    talentId: string,
    data:
      LanguagePayload,
  ) {
    await this.ensureTalent(
      talentId,
    );

    const language =
      data.language
        ?.trim();

    if (!language) {
      throw new BadRequestException(
        'Language is required',
      );
    }

    const level =
      this.normalizeLanguageLevel(
        data.level,
      );

    const existing =
      await this.prisma.talentLanguage.findFirst({
        where: {
          talentId,

          language: {
            equals:
              language,

            mode:
              'insensitive',
          },
        },
      });

    if (existing) {
      throw new BadRequestException(
        'This language is already added',
      );
    }

    return this.prisma.talentLanguage.create({
      data: {
        talentId,
        language,
        level,
      },
    });
  }

  async updateLanguage(
    talentId: string,
    languageId:
      string,
    data:
      LanguagePayload,
  ) {
    await this.ensureTalent(
      talentId,
    );

    const existing =
      await this.prisma.talentLanguage.findFirst({
        where: {
          id:
            languageId,

          talentId,
        },
      });

    if (!existing) {
      throw new NotFoundException(
        'Language record not found',
      );
    }

    const updateData:
      Record<
        string,
        any
      > = {};

    if (
      data.language !==
      undefined
    ) {
      const language =
        data.language.trim();

      if (!language) {
        throw new BadRequestException(
          'Language is required',
        );
      }

      updateData.language =
        language;
    }

    if (
      data.level !==
      undefined
    ) {
      updateData.level =
        this.normalizeLanguageLevel(
          data.level,
        );
    }

    return this.prisma.talentLanguage.update({
      where: {
        id:
          languageId,
      },

      data:
        updateData,
    });
  }

  async removeLanguage(
    talentId: string,
    languageId:
      string,
  ) {
    await this.ensureTalent(
      talentId,
    );

    const language =
      await this.prisma.talentLanguage.findFirst({
        where: {
          id:
            languageId,

          talentId,
        },
      });

    if (!language) {
      throw new NotFoundException(
        'Language record not found',
      );
    }

    await this.prisma.talentLanguage.delete({
      where: {
        id:
          languageId,
      },
    });

    return {
      success: true,
    };
  }

  async exportExcel() {
    const talents =
      await this.prisma.talent.findMany({
        orderBy: {
          fullName:
            'asc',
        },

        include: {
          skills: {
            orderBy: {
              name:
                'asc',
            },
          },

          languages: {
            orderBy: {
              language:
                'asc',
            },
          },
        },
      });

    const workbook =
      new ExcelJS.Workbook();

    workbook.creator =
      'ProRabotka';

    workbook.created =
      new Date();

    const worksheet =
      workbook.addWorksheet(
        'Talents',
      );

    worksheet.columns = [
      {
        header:
          'Full Name',
        key:
          'fullName',
        width:
          28,
      },

      {
        header:
          'Position',
        key:
          'position',
        width:
          24,
      },

      {
        header:
          'Phone',
        key:
          'phone',
        width:
          18,
      },

      {
        header:
          'Email',
        key:
          'email',
        width:
          28,
      },

      {
        header:
          'Telegram',
        key:
          'telegram',
        width:
          20,
      },

      {
        header:
          'Location',
        key:
          'location',
        width:
          20,
      },

      {
        header:
          'Current Company',
        key:
          'currentCompany',
        width:
          24,
      },

      {
        header:
          'Experience Years',
        key:
          'experienceYears',
        width:
          16,
      },

      {
        header:
          'Status',
        key:
          'status',
        width:
          18,
      },

      {
        header:
          'Skills',
        key:
          'skills',
        width:
          40,
      },

      {
        header:
          'Languages',
        key:
          'languages',
        width:
          40,
      },

      {
        header:
          'Salary Expectation',
        key:
          'salaryExpectation',
        width:
          18,
      },

      {
        header:
          'Currency',
        key:
          'salaryCurrency',
        width:
          12,
      },

      {
        header:
          'LinkedIn',
        key:
          'linkedinUrl',
        width:
          32,
      },

      {
        header:
          'GitHub',
        key:
          'githubUrl',
        width:
          32,
      },

      {
        header:
          'Portfolio',
        key:
          'portfolioUrl',
        width:
          32,
      },

      {
        header:
          'Notes',
        key:
          'notes',
        width:
          45,
      },
    ];

    for (
      const talent of
      talents
    ) {
      worksheet.addRow({
        fullName:
          talent.fullName,

        position:
          talent.position ||
          '',

        phone:
          talent.phone ||
          '',

        email:
          talent.email ||
          '',

        telegram:
          talent.telegram ||
          '',

        location:
          talent.location ||
          '',

        currentCompany:
          talent.currentCompany ||
          '',

        experienceYears:
          talent.experienceYears ??
          '',

        status:
          this.humanizeStatus(
            talent.status,
          ),

        skills:
          talent.skills
            .map(
              (
                skill,
              ) =>
                skill.name,
            )
            .join(
              ', ',
            ),

        languages:
          talent.languages
            .map(
              (
                language,
              ) =>
                `${language.language} - ${this.humanizeLevel(
                  language.level,
                )}`,
            )
            .join(
              ', ',
            ),

        salaryExpectation:
          talent.salaryExpectation
            ? Number(
                talent.salaryExpectation,
              )
            : '',

        salaryCurrency:
          talent.salaryCurrency ||
          '',

        linkedinUrl:
          talent.linkedinUrl ||
          '',

        githubUrl:
          talent.githubUrl ||
          '',

        portfolioUrl:
          talent.portfolioUrl ||
          '',

        notes:
          talent.notes ||
          '',
      });
    }

    const headerRow =
      worksheet.getRow(
        1,
      );

    headerRow.font = {
      bold: true,
    };

    headerRow.alignment = {
      vertical:
        'middle',
    };

    headerRow.height =
      22;

    worksheet.views = [
      {
        state:
          'frozen',

        ySplit:
          1,
      },
    ];

    worksheet.autoFilter = {
      from:
        'A1',

      to:
        'Q1',
    };

    worksheet.eachRow(
      (
        row,
        rowNumber,
      ) => {
        if (
          rowNumber >
          1
        ) {
          row.alignment = {
            vertical:
              'top',

            wrapText:
              true,
          };
        }
      },
    );

    const buffer =
      await workbook.xlsx.writeBuffer();

    return Buffer.from(
      buffer,
    );
  }

  private async ensureTalent(
    id: string,
  ) {
    const talent =
      await this.prisma.talent.findUnique({
        where: {
          id,
        },

        select: {
          id: true,
        },
      });

    if (!talent) {
      throw new NotFoundException(
        'Talent not found',
      );
    }

    return talent;
  }

  private normalizeStatus(
    value?: string,
  ):
    | 'AVAILABLE'
    | 'OPEN_TO_OFFERS'
    | 'EMPLOYED'
    | 'NOT_AVAILABLE' {
    const status =
      value
        ?.trim()
        .toUpperCase() ||
      'AVAILABLE';

    const allowed = [
      'AVAILABLE',
      'OPEN_TO_OFFERS',
      'EMPLOYED',
      'NOT_AVAILABLE',
    ] as const;

    if (
      !allowed.includes(
        status as
          (typeof allowed)[number],
      )
    ) {
      throw new BadRequestException(
        'Invalid talent status',
      );
    }

    return status as
      | 'AVAILABLE'
      | 'OPEN_TO_OFFERS'
      | 'EMPLOYED'
      | 'NOT_AVAILABLE';
  }

  private normalizeLanguageLevel(
    value?: string,
  ):
    | 'BASIC'
    | 'INTERMEDIATE'
    | 'ADVANCED'
    | 'FLUENT'
    | 'NATIVE' {
    const level =
      value
        ?.trim()
        .toUpperCase();

    const allowed = [
      'BASIC',
      'INTERMEDIATE',
      'ADVANCED',
      'FLUENT',
      'NATIVE',
    ] as const;

    if (
      !level ||
      !allowed.includes(
        level as
          (typeof allowed)[number],
      )
    ) {
      throw new BadRequestException(
        'Language level must be BASIC, INTERMEDIATE, ADVANCED, FLUENT or NATIVE',
      );
    }

    return level as
      | 'BASIC'
      | 'INTERMEDIATE'
      | 'ADVANCED'
      | 'FLUENT'
      | 'NATIVE';
  }

  private parseExperienceYears(
    value:
      | number
      | string
      | null
      | undefined,
  ) {
    if (
      value ===
        null ||
      value ===
        undefined ||
      value ===
        ''
    ) {
      return null;
    }

    const number =
      Number(
        value,
      );

    if (
      !Number.isInteger(
        number,
      ) ||
      number <
        0 ||
      number >
        100
    ) {
      throw new BadRequestException(
        'Experience years must be a valid whole number',
      );
    }

    return number;
  }

  private parseOptionalAmount(
    value:
      | number
      | string
      | null
      | undefined,

    label:
      string,
  ) {
    if (
      value ===
        null ||
      value ===
        undefined ||
      value ===
        ''
    ) {
      return null;
    }

    const number =
      Number(
        value,
      );

    if (
      !Number.isFinite(
        number,
      ) ||
      number <
        0
    ) {
      throw new BadRequestException(
        `${label} must be a valid positive number`,
      );
    }

    return number;
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

  private humanizeStatus(
    value:
      string,
  ) {
    return value
      .toLowerCase()
      .split('_')
      .map(
        (
          word,
        ) =>
          word
            .charAt(0)
            .toUpperCase() +
          word.slice(
            1,
          ),
      )
      .join(
        ' ',
      );
  }

  private humanizeLevel(
    value:
      string,
  ) {
    return value
      .toLowerCase()
      .replace(
        /^./,
        (
          letter,
        ) =>
          letter.toUpperCase(),
      );
  }
}