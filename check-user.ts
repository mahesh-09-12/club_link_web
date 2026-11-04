import { db } from './src/db/index.ts';
import { users } from './src/db/schema.ts';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

async function checkAndFixUser() {
  const email = 'test@campus.edu';
  console.log(`Checking user: ${email}`);
  
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  try {
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length === 0) {
      console.log("User not found, creating...");
      await db.insert(users).values({
        full_name: 'Test User',
        email: email,
        password_hash: hashedPassword,
        role: 'student',
      });
      console.log("User created successfully.");
    } else {
      console.log("User found, updating password...");
      await db.update(users).set({ password_hash: hashedPassword }).where(eq(users.email, email));
      console.log("Password updated.");
    }
  } catch (err) {
    console.error(err);
  }
}

checkAndFixUser().catch(console.error);
