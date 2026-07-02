import { Client } from 'pg';
import { ENV } from '../config/env.config';

async function createDatabaseIfNotExists(): Promise<void> {
  const client = new Client({
    host: ENV.DB_HOST,
    port: ENV.DB_PORT,
    user: ENV.DB_USERNAME,
    password: ENV.DB_PASSWORD,
    database: 'postgres',
  });

  try {
    await client.connect();

    const res = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [ENV.DB_DATABASE],
    );

    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE "${ENV.DB_DATABASE}"`);
      console.log(`✅ Database "${ENV.DB_DATABASE}" created successfully.`);
    } else {
      console.log(`ℹ️  Database "${ENV.DB_DATABASE}" already exists.`);
    }
  } catch (error) {
    console.error('❌ Failed to create database:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

// Run if executed directly
if (require.main === module) {
  createDatabaseIfNotExists()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { createDatabaseIfNotExists };
