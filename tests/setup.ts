import { db } from '../src/db/index.ts';
import { users } from '../src/db/schema.ts';
import { sql, eq } from 'drizzle-orm';
import { beforeAll, afterAll } from 'vitest';
import bcrypt from 'bcrypt';

beforeAll(async () => {
  // Ensure demo users exist for UI/integration tests
  const demoUsers = [
    { name: 'Alex Johnson', email: 'student@campus.edu', role: 'student' },
    { name: 'Sarah Miller', email: 'coordinator@campus.edu', role: 'club_coordinator' },
    { name: 'Dr. Robert Vance', email: 'faculty@campus.edu', role: 'faculty_coordinator' },
  ];

  const hashedPassword = await bcrypt.hash('password123', 10);
  for (const demo of demoUsers) {
    const existing = await db.select().from(users).where(eq(users.email, demo.email));
    if (existing.length === 0) {
      await db.insert(users).values({
        full_name: demo.name,
        email: demo.email,
        password_hash: hashedPassword,
        role: demo.role,
      });
    }
  }
});

afterAll(async () => {
  // Clear only test-generated records without deleting primary demo users
  await db.execute(sql`
    DELETE FROM join_requests WHERE student_id IN (SELECT id FROM users WHERE email LIKE '%@test.com' OR email LIKE 'api_%');
    DELETE FROM events WHERE title LIKE '%Test%';
    DELETE FROM announcements WHERE title LIKE '%Test%';
    DELETE FROM clubs WHERE name LIKE '%Test%' OR name LIKE 'Club_%';
    DELETE FROM users WHERE email LIKE '%@test.com' OR email LIKE 'api_%';
  `);
});
