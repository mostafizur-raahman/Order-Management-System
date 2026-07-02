import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ENV } from './config/env.config';
import { createDatabaseIfNotExists } from './scripts/create-database';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { LoggingInterceptor } from './common/interceptor/logging.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

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
          winston.format.json(),
        ),
      }),
    ],
  });

  const app = await NestFactory.create(AppModule, { logger });
  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global JWT authentication
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  // Register logging interceptor globally
  app.useGlobalInterceptors(new LoggingInterceptor());

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
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // CORS
  app.enableCors({
    origin: ENV.FRONTEND_URL,
    credentials: true,
  });

  await app.listen(ENV.PORT);

  logger.log('Application started', 'Bootstrap');
  console.log(`Application running on: http://localhost:${ENV.PORT}`);
  console.log(`Swagger documentation: http://localhost:${ENV.PORT}/api`);
}

bootstrap();
