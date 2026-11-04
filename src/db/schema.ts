import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  full_name: text('full_name').notNull(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  role: text('role').notNull().default('student'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const clubs = pgTable('clubs', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  tagline: text('tagline'),
  faculty_coordinator_id: integer('faculty_coordinator_id').references(() => users.id),
  club_coordinator_id: integer('club_coordinator_id').references(() => users.id),
  status: text('status').notNull().default('active'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const joinRequests = pgTable('join_requests', {
  id: serial('id').primaryKey(),
  student_id: integer('student_id').references(() => users.id).notNull(),
  club_id: integer('club_id').references(() => clubs.id).notNull(),
  status: text('status').notNull().default('pending'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});


export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  club_id: integer('club_id').references(() => clubs.id).notNull(),
  title: text('title').notNull(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  location: text('location').notNull(),
  description: text('description'),
  rsvp_count: integer('rsvp_count').default(0).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const announcements = pgTable('announcements', {
  id: serial('id').primaryKey(),
  club_id: integer('club_id').references(() => clubs.id).notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});
