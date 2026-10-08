import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import {
  PassportStrategy,
} from '@nestjs/passport';

import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';

import {
  PrismaService,
} from '../prisma/prisma.service.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
) {
  constructor(
    private readonly prisma:
      PrismaService,

    private readonly configService:
      ConfigService,
  ) {
    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration:
        false,

      secretOrKey:
        configService.getOrThrow<string>(
          'JWT_SECRET',
        ),
    });
  }

  async validate(
    payload: {
      sub: string;
    },
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: payload.sub,
        },

        select: {
          id: true,
          name: true,
          surname: true,
          email: true,
          role: true,
          position: true,
          approvalStatus:
            true,
          isActive: true,
        },
      });

    if (!user) {
      throw new UnauthorizedException();
    }

    const superAdmin =
      this.isSuperAdminEmail(
        user.email,
      );

    if (!user.isActive) {
      throw new UnauthorizedException();
    }

    if (
      !superAdmin &&
      user.approvalStatus !==
        'APPROVED'
    ) {
      throw new UnauthorizedException();
    }

    return {
      ...user,

      isSuperAdmin:
        superAdmin,
    };
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
}