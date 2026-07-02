import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ENV } from './env.config';

export const getDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: ENV.DB_HOST,
  port: ENV.DB_PORT,
  username: ENV.DB_USERNAME,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_DATABASE,

  autoLoadEntities: true,
  synchronize: ENV.DB_SYNCHRONIZE,
  logging: ENV.DB_LOGGING,

  extra: {
    max: 10,
    connectionTimeoutMillis: 5000,
  },
});
