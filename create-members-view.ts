import { sql } from 'drizzle-orm';
import { db } from './src/db/index.ts';

async function createMembersView() {
  console.log("Creating members view...");
  try {
    await db.execute(sql`
      CREATE OR REPLACE VIEW members AS
      SELECT 
        student_id, 
        club_id, 
        created_at AS joined_at
      FROM join_requests
      WHERE status = 'approved';
    `);
    console.log("Members view created successfully.");
  } catch (err) {
    console.error("Error creating members view:", err);
  }
}

createMembersView();
