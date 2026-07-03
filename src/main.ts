import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AppModule } from './app.module';
import { ENV } from './config/env.config';
import { createDatabaseIfNotExists } from './scripts/create-database';
import { LoggingInterceptor } from './common/interceptor/logging.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

const LOGS_DIR = path.join(process.cwd(), 'logs');

function ensureLogsDir(): void {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
}

function createWinstonLogger() {
  return WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, context }) => {
            return `${timestamp} [${context || 'Nest'}] ${level}: ${message}`;
          }),
        ),
      }),
      new winston.transports.File({
        filename: path.join(LOGS_DIR, 'combined.log'),
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.json(),
        ),
      }),
    ],
  });
}

function setupGlobalPipesAndGuards(
  app: INestApplication,
  reflector: Reflector,
): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalGuards(new JwtAuthGuard(reflector), new RolesGuard(reflector));
  app.useGlobalInterceptors(new LoggingInterceptor());
}

function setupSwagger(app: INestApplication): void {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Order Management System API')
    .setDescription(
      'API documentation for OMS with JWT authentication and role-based access control',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token',
    )
    .addTag('Authentication', 'User registration and login endpoints')
    .addTag('Users', 'User management endpoints (Admin only)')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
}

async function bootstrap() {
  ensureLogsDir();
  await createDatabaseIfNotExists();

  const logger = createWinstonLogger();
  const app = await NestFactory.create(AppModule, { logger });
  const reflector = app.get(Reflector);

  setupGlobalPipesAndGuards(app, reflector);
  setupSwagger(app);

  app.enableCors({
    origin: ENV.FRONTEND_URL,
    credentials: true,
  });

  await app.listen(ENV.PORT);

  logger.log('Application started', 'Bootstrap');
  console.log(`Application running on: http://localhost:${ENV.PORT}`);
  console.log(`Swagger documentation: http://localhost:${ENV.PORT}/api-docs`);
}

bootstrap();
