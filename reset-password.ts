import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { workshopUsers } from './drizzle/schema/workshop-users';
import { eq } from 'drizzle-orm';

// Load environment variables
dotenv.config({ path: '.env.local' });
if (!process.env.DATABASE_URL) {
  dotenv.config(); // fallback to .env
}

async function resetTestUserPassword() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const db = drizzle(pool);

  try {
    const email = 'wpadmin@gmail.com';
    const newPassword = 'NewAdmin123!';
    
    console.log(`Updating password for ${email} to ${newPassword}`);

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    const result = await db.update(workshopUsers)
      .set({ passwordHash })
      .where(eq(workshopUsers.email, email))
      .returning();

    if (result.length > 0) {
        console.log('Password updated successfully for user:', result[0].id);
    } else {
        console.log('User not found!');
    }

  } catch (error: any) {
    console.error('Error updating password:', error);
  } finally {
    await pool.end();
  }
}

resetTestUserPassword();
