import { ENV } from './env.config';

export default () => ({
  app: {
    nodeEnv: ENV.NODE_ENV,
    port: ENV.PORT,
    isProduction: ENV.isProduction(),
  },
  database: {
    host: ENV.DB_HOST,
    port: ENV.DB_PORT,
    username: ENV.DB_USERNAME,
    password: ENV.DB_PASSWORD,
    database: ENV.DB_DATABASE,
    synchronize: ENV.DB_SYNCHRONIZE,
    logging: ENV.DB_LOGGING,
  },
  jwt: {
    secret: ENV.JWT_SECRET,
    expiresIn: ENV.JWT_EXPIRES_IN,
  },
});
