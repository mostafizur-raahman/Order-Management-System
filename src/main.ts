import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ENV } from './config/env.config';
import { createDatabaseIfNotExists } from './scripts/create-database';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { LoggingInterceptor } from './common/interceptor/logging.interceptor';

async function bootstrap() {
  await createDatabaseIfNotExists();

  // Create Winston logger with JSON format for file
  const logger = WinstonModule.createLogger({
    transports: [
      // Console transport (readable format)
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, context }) => {
            return `${timestamp} [${context || 'Nest'}] ${level}: ${message}`;
          }),
        ),
      }),
      // File transport (JSON format)
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.json(), // This saves as JSON
        ),
      }),
    ],
  });

  const app = await NestFactory.create(AppModule, { logger });
  const configService = app.get(ConfigService);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Register logging interceptor globally
  app.useGlobalInterceptors(new LoggingInterceptor());

  // CORS
  app.enableCors({
    origin: ENV.FRONTEND_URL,
    credentials: true,
  });

  await app.listen(ENV.PORT);

  logger.log('Application started', 'Bootstrap');
  console.log(`✅ Application running on: http://localhost:${ENV.PORT}`);
  console.log(`📄 Logs saved to: logs/combined.log (JSON format)`);
}

bootstrap();
