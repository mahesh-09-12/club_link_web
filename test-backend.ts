import 'dotenv/config';
import { db } from './src/db/index.ts';
import { clubs, users } from './src/db/schema.ts';
import { eq } from 'drizzle-orm';

async function testCrud() {
  console.log("Starting CRUD tests...");
  
  // 1. Browse Clubs (Everyone)
  const allClubs = await db.select().from(clubs);
  console.log("Browse Clubs Test:", allClubs.length > 0 ? "PASSED" : "FAILED");

  // 2. Create Club (Faculty) - Requires faculty user
  const faculty = await db.select().from(users).where(eq(users.role, 'faculty_coordinator')).limit(1);
  if (faculty.length > 0) {
    const [newClub] = await db.insert(clubs).values({
      name: "Test Club",
      category: "Test Category",
      description: "Test Description",
      faculty_coordinator_id: faculty[0].id,
      status: "active",
    }).returning();
    console.log("Create Club Test:", newClub.id ? "PASSED" : "FAILED");
    
    // 3. Update Club
    const [updated] = await db.update(clubs).set({ name: "Updated Club" }).where(eq(clubs.id, newClub.id)).returning();
    console.log("Update Club Test:", updated.name === "Updated Club" ? "PASSED" : "FAILED");
    
    // 4. Delete Club
    await db.delete(clubs).where(eq(clubs.id, newClub.id));
    const deleted = await db.select().from(clubs).where(eq(clubs.id, newClub.id));
    console.log("Delete Club Test:", deleted.length === 0 ? "PASSED" : "FAILED");
  } else {
    console.log("Create/Update/Delete Tests skipped: No faculty user found.");
  }
}

testCrud().catch(console.error);
