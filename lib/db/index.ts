import 'server-only';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@/drizzle/schema';

/**
 * Workshop database client (Drizzle ORM).
 *
 * This connects to the WORKSHOP-SPECIFIC PostgreSQL database (workshop_db).
 * It is separate from the authorization-service database.
 *
 * This module is marked `server-only` — it will throw a build error
 * if accidentally imported in a Client Component.
 */
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000, // Increased to 30s for serverless wake-up
};

// Global singleton to prevent connection leaks during Next.js HMR in development
const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};

const pool = globalForDb.pool ?? new Pool(poolConfig);

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle database client:', err);
});

export const db = drizzle(pool, { schema });

export type Database = typeof db;
