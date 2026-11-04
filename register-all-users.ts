import { db } from './src/db/index.ts';
import { users } from './src/db/schema.ts';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

async function registerAllUsers() {
  const usersToRegister = [
    { name: 'Student User', email: 'student@campus.edu', password: 'password123', role: 'student' },
    { name: 'Club Coordinator', email: 'coordinator@campus.edu', password: 'password123', role: 'club_coordinator' },
    { name: 'Faculty Coordinator', email: 'faculty@campus.edu', password: 'password123', role: 'faculty_coordinator' }
  ];

  const hashedPassword = await bcrypt.hash('password123', 10);

  for (const u of usersToRegister) {
    console.log(`Processing: ${u.email}`);
    try {
      const existing = await db.select().from(users).where(eq(users.email, u.email));
      if (existing.length === 0) {
        await db.insert(users).values({
          full_name: u.name,
          email: u.email,
          password_hash: hashedPassword,
          role: u.role,
        });
        console.log(`Registered ${u.role}: ${u.email}`);
      } else {
        await db.update(users).set({ password_hash: hashedPassword, role: u.role }).where(eq(users.email, u.email));
        console.log(`Updated ${u.role}: ${u.email}`);
      }
    } catch (err) {
      console.error(`Failed to register ${u.email}:`, err);
    }
  }
}

registerAllUsers().catch(console.error);
