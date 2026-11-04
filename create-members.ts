import { sql } from 'drizzle-orm';
import { db } from './src/db/index.ts';

async function createMembersTable() {
  console.log("Creating members table manually...");
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "members" (
        "id" serial PRIMARY KEY NOT NULL,
        "student_id" integer NOT NULL REFERENCES "users"("id"),
        "club_id" integer NOT NULL REFERENCES "clubs"("id"),
        "joined_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "unique_member_constraint" UNIQUE("student_id", "club_id")
      );
    `);
    console.log("Members table created successfully.");
  } catch (err) {
    console.error("Error creating members table:", err);
  }
}

createMembersTable();
