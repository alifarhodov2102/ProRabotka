import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import {
  JwtService,
} from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import {
  PrismaService,
} from '../prisma/prisma.service.js';

type RegisterInput = {
  name: string;
  surname: string;
  role: string;
  email: string;
  password: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma:
      PrismaService,

    private readonly jwtService:
      JwtService,

    private readonly configService:
      ConfigService,
  ) {}

  async register(
    data: RegisterInput,
  ) {
    const firstName =
      data.name?.trim();

    const surname =
      data.surname?.trim();

    const role =
      data.role?.trim();

    const email =
      data.email
        ?.trim()
        .toLowerCase();

    const password =
      data.password || '';

    if (!firstName) {
      throw new BadRequestException(
        'Name is required',
      );
    }

    if (!surname) {
      throw new BadRequestException(
        'Surname is required',
      );
    }

    if (!role) {
      throw new BadRequestException(
        'Role is required',
      );
    }

    if (!email) {
      throw new BadRequestException(
        'Email is required',
      );
    }

    if (password.length < 6) {
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
      throw new ConflictException(
        'An account with this email already exists',
      );
    }

    const passwordHash =
      await bcrypt.hash(
        password,
        12,
      );

    const fullName =
      `${firstName} ${surname}`
        .replace(
          /\s+/g,
          ' ',
        )
        .trim();

    await this.prisma.user.create({
      data: {
        name: fullName,
        surname,
        role,
        position: role,
        email,
        password:
          passwordHash,

        approvalStatus:
          'PENDING',

        isActive: true,
      },
    });

    return {
      success: true,
      status: 'PENDING',

      message:
        'Registration received. Your account is waiting for approval.',
    };
  }

  async login(
    email: string,
    password: string,
  ) {
    const normalizedEmail =
      email
        ?.trim()
        .toLowerCase();

    const user =
      await this.prisma.user.findUnique({
        where: {
          email:
            normalizedEmail,
        },
      });

    if (!user) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    const passwordMatches =
      await bcrypt.compare(
        password || '',
        user.password,
      );

    if (!passwordMatches) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    const superAdmin =
      this.isSuperAdminEmail(
        user.email,
      );

    if (
      !superAdmin &&
      user.approvalStatus ===
        'PENDING'
    ) {
      throw new UnauthorizedException(
        'Your account is waiting for approval.',
      );
    }

    if (
      !superAdmin &&
      user.approvalStatus ===
        'REJECTED'
    ) {
      throw new UnauthorizedException(
        'Your registration request was not approved.',
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Your account is inactive.',
      );
    }

    const accessToken =
      await this.jwtService.signAsync({
        sub: user.id,
        email: user.email,
        name: user.name,
      });

    return {
      accessToken,

      user: {
        id: user.id,
        name: user.name,
        surname:
          user.surname,
        email: user.email,
        role: user.role,
        position:
          user.position,

        approvalStatus:
          superAdmin
            ? 'APPROVED'
            : user.approvalStatus,

        isSuperAdmin:
          superAdmin,
      },
    };
  }

  isSuperAdminEmail(
    email: string,
  ) {
    const ownerEmail =
      this.configService
        .get<string>(
          'SUPER_ADMIN_EMAIL',
        )
        ?.trim()
        .toLowerCase();

    if (!ownerEmail) {
      return false;
    }

    return (
      email
        .trim()
        .toLowerCase() ===
      ownerEmail
    );
  }
}