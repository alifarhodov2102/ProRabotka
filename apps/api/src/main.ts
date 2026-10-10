import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (
        error: Error | null,
        allow?: boolean,
      ) => void,
    ) => {
      if (
        !origin ||
        origin === 'http://localhost:3000' ||
        origin.endsWith('.vercel.app')
      ) {
        callback(null, true);
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

  await app.listen(
    process.env.PORT ?? 4000,
  );
}

bootstrap();