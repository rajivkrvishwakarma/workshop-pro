/**
 * Workshop-specific user profile.
 *
 * The actual auth data (password, email, sessions) lives in the authorization-service DB.
 * This table stores workshop-specific metadata and links to the auth user via authUserId.
 */
import { pgTable, uuid, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';

export const workshopUsers = pgTable('workshop_users', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Links to users.id in the authorization-service database (Legacy)
  authUserId: uuid('auth_user_id').unique(),

  // Local Auth Fields
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),

  employeeCode: varchar('employee_code', { length: 50 }).unique(),
  department: varchar('department', { length: 100 }),
  designation: varchar('designation', { length: 100 }),

  isActive: boolean('is_active').default(true).notNull(),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});
