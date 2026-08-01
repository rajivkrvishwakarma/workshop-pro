import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { workshopUsers } from './drizzle/schema/workshop-users';

// Load environment variables
dotenv.config({ path: '.env.local' });
if (!process.env.DATABASE_URL) {
  dotenv.config(); // fallback to .env
}

async function createTestUser() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const db = drizzle(pool);

  try {
    const email = 'wpadmin@gmail.com';
    const password = 'Admin123#';
    
    console.log(`Creating test user with email: ${email} and password: ${password}`);

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await db.insert(workshopUsers).values({
      email,
      passwordHash,
      firstName: 'Workshop',
      lastName: 'Admin',
      employeeCode: 'ADMIN001',
      isActive: true,
    }).returning();

    console.log('User created successfully:', result[0].id);

  } catch (error: any) {
    if (error.code === '23505') {
      console.log('Test user already exists!');
    } else {
      console.error('Error creating test user:', error);
    }
  } finally {
    await pool.end();
  }
}

createTestUser();
