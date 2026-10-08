import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';

import {
  AuthService,
} from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService:
      AuthService,
  ) {}

  @Post('register')
  register(
    @Body()
    body: {
      name: string;
      surname: string;
      role: string;
      email: string;
      password: string;
    },
  ) {
    return this.authService.register(
      body,
    );
  }

  @Post('login')
  login(
    @Body()
    body: {
      email: string;
      password: string;
    },
  ) {
    return this.authService.login(
      body.email,
      body.password,
    );
  }
}