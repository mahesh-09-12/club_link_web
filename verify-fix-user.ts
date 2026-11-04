import { db } from './src/db/index.ts';
import { users } from './src/db/schema.ts';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

async function verifyAndFixUser() {
  console.log("Verifying test user...");
  const email = 'student@campus.edu';
  
  const existingUser = await db.select().from(users).where(eq(users.email, email));
  
  if (existingUser.length === 0) {
    console.log("Test user not found, registering...");
    const hashedPassword = await bcrypt.hash('password123', 10);
    await db.insert(users).values({
      full_name: 'Test Student',
      email: email,
      password_hash: hashedPassword,
      role: 'student',
    });
    console.log("Test user registered successfully.");
  } else {
    console.log("Test user already exists, resetting password...");
    const hashedPassword = await bcrypt.hash('password123', 10);
    await db.update(users).set({ password_hash: hashedPassword }).where(eq(users.email, email));
    console.log("Password reset successfully.");
  }
}

verifyAndFixUser().catch(console.error);
