import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: '.env' });
}

async function run() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Altering workshop_users table...');
    
    await pool.query(`
      ALTER TABLE "workshop_users" ADD COLUMN IF NOT EXISTS "email" varchar(255);
      ALTER TABLE "workshop_users" ADD COLUMN IF NOT EXISTS "password_hash" varchar(255);
      ALTER TABLE "workshop_users" ADD COLUMN IF NOT EXISTS "first_name" varchar(100);
      ALTER TABLE "workshop_users" ADD COLUMN IF NOT EXISTS "last_name" varchar(100);
      ALTER TABLE "workshop_users" ALTER COLUMN "auth_user_id" DROP NOT NULL;
    `);

    // We can also add UNIQUE constraint to email if it doesn't exist, but IF NOT EXISTS for constraints is tricky in postgres.
    // Let's just create it, it might fail if it exists so we catch it.
    try {
      await pool.query(`ALTER TABLE "workshop_users" ADD CONSTRAINT "workshop_users_email_unique" UNIQUE("email");`);
    } catch (e: any) {
      if (e.code !== '42710') { // duplicate_object
        console.warn('Could not add unique constraint to email:', e.message);
      }
    }

    console.log('Columns added successfully.');
  } catch (error) {
    console.error('Error altering table:', error);
  } finally {
    await pool.end();
  }
}

run();
