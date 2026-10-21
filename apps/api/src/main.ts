import {
  NestFactory,
} from '@nestjs/core';

import {
  NestExpressApplication,
} from '@nestjs/platform-express';

import {
  join,
} from 'path';

import {
  AppModule,
} from './app.module.js';

async function bootstrap() {
  const app =
    await NestFactory.create<NestExpressApplication>(
      AppModule,
    );

  app.enableCors({
    origin: (
      origin:
        | string
        | undefined,

      callback: (
        error:
          | Error
          | null,

        allow?: boolean,
      ) => void,
    ) => {
      if (
        !origin ||
        origin ===
          'http://localhost:3000' ||
        origin ===
          'https://prorabotka.win' ||
        origin.endsWith(
          '.vercel.app',
        )
      ) {
        callback(
          null,
          true,
        );

        return;
      }

      callback(
        new Error(
          'Not allowed by CORS',
        ),
      );
    },

    credentials: true,
  });

  app.useStaticAssets(
    join(
      process.cwd(),
      'storage',
      'startup-logos',
    ),
    {
      prefix:
        '/startup-logos/',
    },
  );

  app.useStaticAssets(
    join(
      process.cwd(),
      'storage',
      'talent-photos',
    ),
    {
      prefix:
        '/talent-photos/',
    },
  );

  await app.listen(
    process.env.PORT ??
      4000,
  );
}

bootstrap();