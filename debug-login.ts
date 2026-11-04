import { db } from './src/db/index.ts';
import { users } from './src/db/schema.ts';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

async function createNewTestUser() {
  const email = 'test@campus.edu';
  console.log(`Checking/Creating user: ${email}`);
  
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  try {
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length === 0) {
      await db.insert(users).values({
        full_name: 'Test User',
        email: email,
        password_hash: hashedPassword,
        role: 'student',
      });
      console.log("User created successfully.");
    } else {
      await db.update(users).set({ password_hash: hashedPassword }).where(eq(users.email, email));
      console.log("User updated.");
    }
  } catch (err) {
    console.error(err);
  }
}

createNewTestUser().catch(console.error);
